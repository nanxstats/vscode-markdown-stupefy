#!/usr/bin/env node

const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
	console.error('Usage: parse-emoji-data.js <input-file> <output-ts-file>');
	process.exit(1);
}

const [inputFile, outputTsFile] = args;

// ASCII and common symbols that should NOT be treated as emoji
// These can form emoji with variation selectors but are primarily text
const excludeRanges = [
	0x0023,           // # hash sign
	0x002A,           // * asterisk
	[0x0030, 0x0039], // 0-9 digits
	0x00A9,           // © copyright
	0x00AE,           // ® registered
	0x2122,           // ™ trade mark
	[0x2000, 0x206F], // General punctuation
	[0x2070, 0x209F], // Superscripts and subscripts
	[0x20A0, 0x20CF], // Currency symbols
	[0x2100, 0x214F], // Letterlike symbols
	[0x2190, 0x21FF], // Arrows (keep as text)
];

function shouldExclude(code) {
	for (const exclude of excludeRanges) {
		if (Array.isArray(exclude)) {
			if (code >= exclude[0] && code <= exclude[1]) return true;
		} else {
			if (code === exclude) return true;
		}
	}
	// Exclude all ASCII printable characters (0x20-0x7E)
	if (code >= 0x20 && code <= 0x7E) return true;
	return false;
}

// Helper function to get section name for better organization
function getSectionName(codepoint) {
	if (codepoint >= 0x1F300 && codepoint <= 0x1F5FF) return 'Symbols and Pictographs';
	if (codepoint >= 0x1F600 && codepoint <= 0x1F64F) return 'Emoticons';
	if (codepoint >= 0x1F680 && codepoint <= 0x1F6FF) return 'Transport and Map';
	if (codepoint >= 0x1F900 && codepoint <= 0x1F9FF) return 'Supplemental Symbols';
	if (codepoint >= 0x1FA70 && codepoint <= 0x1FAFF) return 'Symbols Extended';
	if (codepoint >= 0x2600 && codepoint <= 0x26FF) return 'Miscellaneous Symbols';
	if (codepoint >= 0x2700 && codepoint <= 0x27BF) return 'Dingbats';
	if (codepoint >= 0xE0000) return 'Tags';
	return null;
}

function parseEmojiData(inputFile, outputTsFile) {
	// Read the input file
	const data = fs.readFileSync(inputFile, 'utf8');
	const lines = data.split('\n');
	const emojiRanges = [];

	for (const line of lines) {
		// Skip comments and empty lines
		if (line.startsWith('#') || line.trim() === '' || line.includes('EOF')) {
			continue;
		}

		// Only process lines with 'Emoji' property (not Emoji_Modifier, etc)
		if (!line.includes('; Emoji ')) {
			continue;
		}

		const match = line.match(/^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*Emoji/i);
		if (match) {
			const start = parseInt(match[1], 16);
			if (match[2]) {
				// Range of codepoints - filter out excluded ranges
				const end = parseInt(match[2], 16);
				let rangeStart = null;
				for (let i = start; i <= end; i++) {
					if (!shouldExclude(i)) {
						if (rangeStart === null) {
							rangeStart = i;
						}
					} else if (rangeStart !== null) {
						// End of valid range
						if (rangeStart === i - 1) {
							emojiRanges.push(rangeStart);
						} else {
							emojiRanges.push([rangeStart, i - 1]);
						}
						rangeStart = null;
					}
				}
				// Handle end of range
				if (rangeStart !== null) {
					if (rangeStart === end) {
						emojiRanges.push(rangeStart);
					} else {
						emojiRanges.push([rangeStart, end]);
					}
				}
			} else {
				// Single codepoint - only add if not excluded
				if (!shouldExclude(start)) {
					emojiRanges.push(start);
				}
			}
		}
	}

	// Sort ranges for efficient lookup
	emojiRanges.sort((a, b) => {
		const aVal = Array.isArray(a) ? a[0] : a;
		const bVal = Array.isArray(b) ? b[0] : b;
		return aVal - bVal;
	});

	// Generate TypeScript file with embedded emoji data
	const sourceUrl = 'https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt';
	let tsContent = '// Auto-generated emoji data for web compatibility\n';
	tsContent += '// This file embeds emoji ranges directly to avoid file system dependencies\n';
	tsContent += '// Generated from: ' + sourceUrl + '\n';
	tsContent += '// Generated on: ' + new Date().toISOString() + '\n';
	tsContent += '// Total emoji entries: ' + emojiRanges.length + '\n\n';
	tsContent += '// Format: Each entry is either a single codepoint (number) or a range [start, end]\n';
	tsContent += '// Human-readable comments show the Unicode hex codes and sample characters\n\n';
	tsContent += 'export function getEmojiRanges(): Array<number | [number, number]> {\n';
	tsContent += '\treturn [\n';

	// Add human-readable comments for each entry
	let currentSection = null;
	for (const range of emojiRanges) {
		if (Array.isArray(range)) {
			// Range of codepoints
			const [start, end] = range;
			const newSection = getSectionName(start);
			if (newSection && newSection !== currentSection) {
				tsContent += `\n\t\t// === ${newSection} ===\n`;
				currentSection = newSection;
			}

			const startHex = 'U+' + start.toString(16).toUpperCase().padStart(4, '0');
			const endHex = 'U+' + end.toString(16).toUpperCase().padStart(4, '0');

			// Generate sample characters for the comment
			const samples = [];
			for (let i = start; i <= Math.min(start + 2, end); i++) {
				samples.push(String.fromCodePoint(i));
			}
			if (end > start + 2) samples.push('...');

			tsContent += `\t\t[${start}, ${end}], // ${startHex}..${endHex} ${samples.join('')}\n`;
		} else {
			// Single codepoint
			const newSection = getSectionName(range);
			if (newSection && newSection !== currentSection) {
				tsContent += `\n\t\t// === ${newSection} ===\n`;
				currentSection = newSection;
			}

			const hex = 'U+' + range.toString(16).toUpperCase().padStart(4, '0');
			const char = String.fromCodePoint(range);

			tsContent += `\t\t${range}, // ${hex} ${char}\n`;
		}
	}

	tsContent += '\t];\n';
	tsContent += '}\n';

	// Write the TypeScript file
	fs.writeFileSync(outputTsFile, tsContent);
	console.log(`Generated TypeScript file with ${emojiRanges.length} emoji entries`);
}

// Main execution
try {
	parseEmojiData(inputFile, outputTsFile);
} catch (error) {
	console.error('Error:', error.message);
	process.exit(1);
}
