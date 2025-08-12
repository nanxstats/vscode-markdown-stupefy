import * as vscode from 'vscode';

const STUPEFY_REPLACEMENTS: Map<string, string> = new Map([
	['\u2013', '--'],        // en-dash to double hyphen
	['\u2014', '---'],       // em-dash to triple hyphen
	['\u2018', "'"],         // left single quote to straight quote
	['\u2019', "'"],         // right single quote to straight quote
	['\u201C', '"'],         // left double quote to straight quote
	['\u201D', '"'],         // right double quote to straight quote
	['\u2026', '...'],       // ellipsis to three dots
	['\u2192', '->'],        // right arrow to ASCII arrow
]);

function stupefyText(text: string): string {
	let result = text;
	for (const [smart, ascii] of STUPEFY_REPLACEMENTS) {
		result = result.replace(new RegExp(smart, 'g'), ascii);
	}
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
			vscode.window.showInformationMessage('No smart typography found to stupefy');
			return;
		}

		await editor.edit(editBuilder => {
			editBuilder.replace(fullRange, stupefiedText);
		});

		vscode.window.showInformationMessage('Text successfully stupefied!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }