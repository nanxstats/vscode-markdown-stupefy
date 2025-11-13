import * as vscode from 'vscode';
import { getEmojiRanges } from './emoji-data';

const STUPEFY_REPLACEMENTS: Map<string, string> = new Map([
	['\u2010', '-'],         // hyphen to regular hyphen
	['\u2011', '-'],         // non-breaking hyphen to regular hyphen
	['\u2013', '--'],        // en-dash to double hyphen
	['\u2014', '---'],       // em-dash to triple hyphen
	['\u2E3A', '------'],    // two-em dash to six hyphens
	['\u2E3B', '---------'], // three-em dash to nine hyphens
	['\u2018', "'"],         // left single quote to straight quote
	['\u2019', "'"],         // right single quote to straight quote
	['\u201C', '"'],         // left double quote to straight quote
	['\u201D', '"'],         // right double quote to straight quote
	['\u2022', '-'],         // bullet to hyphen
	['\u2026', '...'],       // ellipsis to three dots
	['\u00A0', ' '],         // non-breaking space to regular space
	['\u202F', ' '],         // narrow no-break space to regular space
	['\u00AB', '<<'],        // left-pointing double angle quotation mark to <<
	['\u00BB', '>>'],        // right-pointing double angle quotation mark to >>
	['\u2190', '&larr;'],    // left arrow to &larr;
	['\u2192', '&rarr;'],    // right arrow to &rarr;
	['\u2191', '&uarr;'],    // up arrow to &uarr;
	['\u2193', '&darr;'],    // down arrow to &darr;
	['\u2194', '&harr;'],    // double headed arrow to &harr;
	['\u2264', '<='],        // less-than or equal to to <=
	['\u2265', '>='],        // greater-than or equal to to >=
	['\u00A9', '&copy;'],    // copyright symbol to &copy;
	['\u00AE', '&reg;'],     // registered trademark symbol to &reg;
	['\u00B0', '&deg;'],     // degree symbol to &deg;
	['\u00B1', '&plusmn;'],  // plus-minus sign to &plusmn;
	['\u2122', '&trade;'],   // trademark symbol to &trade;
	['\uFFFC', ''],          // object replacement character to empty string
]);

export function stupefyText(text: string): string {
	let result = text;
	for (const [smart, ascii] of STUPEFY_REPLACEMENTS) {
		result = result.replace(new RegExp(smart, 'g'), ascii);
	}
	return result;
}

// Load emoji ranges from the embedded data
const emojiRanges = getEmojiRanges();

export function removeEmoji(text: string): string {
	let result = '';
	const codepoints = Array.from(text);

	for (const char of codepoints) {
		const code = char.codePointAt(0);
		if (code === undefined) {
			result += char;
			continue;
		}

		let isEmoji = false;
		for (const range of emojiRanges) {
			if (Array.isArray(range)) {
				if (code >= range[0] && code <= range[1]) {
					isEmoji = true;
					break;
				}
			} else {
				if (code === range) {
					isEmoji = true;
					break;
				}
			}
		}

		if (!isEmoji) {
			result += char;
		}
	}

	return result;
}

export function cleanupWhitespace(text: string): string {
	// Split into lines, preserving the line ending type
	const lines = text.split(/\r?\n/);

	// Trim trailing whitespace from each line
	const trimmedLines = lines.map(line => line.replace(/\s+$/, ''));

	// Join lines back with newlines
	let result = trimmedLines.join('\n');

	// Ensure exactly one newline at the end
	result = result.replace(/\n*$/, '\n');

	return result;
}

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('markdown-stupefy.stupefy', async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found');
			return;
		}

		const document = editor.document;
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);

		const originalText = document.getText();
		const stupefiedText = stupefyText(originalText);

		if (originalText === stupefiedText) {
			vscode.window.showInformationMessage('No smart punctuation found to stupefy');
			return;
		}

		await editor.edit(editBuilder => {
			editBuilder.replace(fullRange, stupefiedText);
		});

		vscode.window.showInformationMessage('Text successfully stupefied!');
	});

	context.subscriptions.push(disposable);

	const removeEmojiDisposable = vscode.commands.registerCommand('markdown-stupefy.removeEmoji', async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found');
			return;
		}

		const document = editor.document;
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);

		const originalText = document.getText();
		const cleanedText = removeEmoji(originalText);

		if (originalText === cleanedText) {
			vscode.window.showInformationMessage('No emoji characters found to remove');
			return;
		}

		await editor.edit(editBuilder => {
			editBuilder.replace(fullRange, cleanedText);
		});

		vscode.window.showInformationMessage('Emoji characters successfully removed!');
	});

	context.subscriptions.push(removeEmojiDisposable);

	const cleanupWhitespaceDisposable = vscode.commands.registerCommand('markdown-stupefy.cleanupWhitespace', async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found');
			return;
		}

		const document = editor.document;
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);

		const originalText = document.getText();
		const cleanedText = cleanupWhitespace(originalText);

		if (originalText === cleanedText) {
			vscode.window.showInformationMessage('No whitespace changes needed');
			return;
		}

		await editor.edit(editBuilder => {
			editBuilder.replace(fullRange, cleanedText);
		});

		vscode.window.showInformationMessage('Whitespace successfully cleaned up!');
	});

	context.subscriptions.push(cleanupWhitespaceDisposable);
}

export function deactivate() { }
