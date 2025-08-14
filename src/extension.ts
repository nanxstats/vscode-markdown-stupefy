import { readFileSync } from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';

const STUPEFY_REPLACEMENTS: Map<string, string> = new Map([
	['\u2013', '--'],        // en-dash to double hyphen
	['\u2014', '---'],       // em-dash to triple hyphen
	['\u2018', "'"],         // left single quote to straight quote
	['\u2019', "'"],         // right single quote to straight quote
	['\u201C', '"'],         // left double quote to straight quote
	['\u201D', '"'],         // right double quote to straight quote
	['\u2026', '...'],       // ellipsis to three dots
	['\u00AB', '<<'],        // left-pointing double angle quotation mark to <<
	['\u00BB', '>>'],        // right-pointing double angle quotation mark to >>
	['\u2190', '<-'],        // left arrow to ASCII arrow
	['\u2192', '->'],        // right arrow to ASCII arrow
	['\u00A9', '&copy;'],    // copyright symbol to &copy;
	['\u00AE', '&reg;'],     // registered trademark symbol to &reg;
	['\u00B0', '&deg;'],     // degree symbol to &deg;
	['\u00B1', '&plusmn;'],  // plus-minus sign to &plusmn;
	['\u2122', '&trade;'],   // trademark symbol to &trade;
]);

export function stupefyText(text: string): string {
	let result = text;
	for (const [smart, ascii] of STUPEFY_REPLACEMENTS) {
		result = result.replace(new RegExp(smart, 'g'), ascii);
	}
	return result;
}

let emojiRanges: Array<number | [number, number]> = [];

function loadEmojiData(context: vscode.ExtensionContext): void {
	const emojiDataPath = join(context.extensionPath, 'assets', 'emoji-data.jsonl');
	const data = readFileSync(emojiDataPath, 'utf8');
	const lines = data.trim().split('\n');

	emojiRanges = [];

	for (const line of lines) {
		if (!line.trim()) {
			continue;
		}

		try {
			const entry = JSON.parse(line);

			// Skip metadata line
			if (entry._metadata) {
				continue;
			}

			if (entry.range) {
				// Range entry
				emojiRanges.push(entry.decimal);
			} else if (entry.code) {
				// Single codepoint entry
				emojiRanges.push(entry.decimal);
			}
		} catch (e) {
			// Skip malformed lines
			continue;
		}
	}
}

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

export function activate(context: vscode.ExtensionContext) {
	// Load emoji data on activation
	loadEmojiData(context);

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
}

export function deactivate() { }
