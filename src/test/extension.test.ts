import { ok, strictEqual } from 'assert';
import * as vscode from 'vscode';
import { activate, stupefyText } from '../extension';

suite('Extension Test Suite', () => {
	suite('stupefyText function', () => {
		test('should convert en-dash to double hyphen', () => {
			const input = 'Pages 10\u201320';
			const expected = 'Pages 10--20';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert em-dash to triple hyphen', () => {
			const input = 'Wait\u2014I forgot something';
			const expected = 'Wait---I forgot something';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert left single quote to straight quote', () => {
			const input = '\u2018Hello world';
			const expected = '\'Hello world';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert right single quote to straight quote', () => {
			const input = 'It\u2019s working';
			const expected = 'It\'s working';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert left double quote to straight quote', () => {
			const input = '\u201CHello world';
			const expected = '"Hello world';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert right double quote to straight quote', () => {
			const input = 'Hello world\u201D';
			const expected = 'Hello world"';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert ellipsis to three dots', () => {
			const input = 'Wait for it\u2026';
			const expected = 'Wait for it...';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert right arrow to ASCII arrow', () => {
			const input = 'Go \u2192 Next';
			const expected = 'Go -> Next';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert multiple smart characters in one string', () => {
			const input = '\u201CIt\u2019s amazing\u201D\u2014she said\u2026';
			const expected = '"It\'s amazing"---she said...';
			strictEqual(stupefyText(input), expected);
		});

		test('should handle text with no smart characters', () => {
			const input = 'This is plain ASCII text!';
			const expected = 'This is plain ASCII text!';
			strictEqual(stupefyText(input), expected);
		});

		test('should handle empty string', () => {
			strictEqual(stupefyText(''), '');
		});

		test('should convert all occurrences of the same character', () => {
			const input = '\u2018quote\u2019 and \u2018another\u2019';
			const expected = '\'quote\' and \'another\'';
			strictEqual(stupefyText(input), expected);
		});

		test('should handle mixed content with code', () => {
			const input = 'Use `code` and \u201Cquotes\u201D together';
			const expected = 'Use `code` and "quotes" together';
			strictEqual(stupefyText(input), expected);
		});

		test('should handle multiline text', () => {
			const input = 'Line 1\u2014with dash\nLine 2\u2026with ellipsis\nLine 3\u2013with en-dash';
			const expected = 'Line 1---with dash\nLine 2...with ellipsis\nLine 3--with en-dash';
			strictEqual(stupefyText(input), expected);
		});

		test('should handle Unicode characters at string boundaries', () => {
			const input = '\u2018start and end\u2019';
			const expected = '\'start and end\'';
			strictEqual(stupefyText(input), expected);
		});

		test('should handle consecutive smart characters', () => {
			const input = '\u2018\u2018nested\u2019\u2019';
			const expected = '\'\'nested\'\'';
			strictEqual(stupefyText(input), expected);
		});
	});

	suite('VS Code Command Integration', () => {
		test('should register command on activation', () => {
			const mockContext = {
				subscriptions: []
			} as unknown as vscode.ExtensionContext;

			activate(mockContext);
			strictEqual(mockContext.subscriptions.length, 1);
		});

		test('command should be registered with correct ID', async () => {
			const commands = await vscode.commands.getCommands();
			ok(commands.includes('markdown-stupefy.stupefy'));
		});
	});
});
