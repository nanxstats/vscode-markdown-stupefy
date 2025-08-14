import { ok, strictEqual } from 'assert';
import { join } from 'path';
import * as vscode from 'vscode';
import { activate, removeEmoji, stupefyText } from '../extension';

suite('Extension Test Suite', () => {
	// Initialize emoji data for tests
	suiteSetup(() => {
		// Create a mock context with the extension path
		const mockContext = {
			subscriptions: [],
			extensionPath: join(__dirname, '..', '..')
		} as unknown as vscode.ExtensionContext;

		// Activate the extension to load emoji data
		activate(mockContext);
	});
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

		test('should convert left-pointing double angle quotation mark to <<', () => {
			const input = '\u00ABQuote\u00BB';
			const expected = '<<Quote>>';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert right-pointing double angle quotation mark to >>', () => {
			const input = 'Text \u00BB';
			const expected = 'Text >>';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert left arrow to ASCII arrow', () => {
			const input = 'Previous \u2190 Back';
			const expected = 'Previous <- Back';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert right arrow to ASCII arrow', () => {
			const input = 'Go \u2192 Next';
			const expected = 'Go -> Next';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert copyright symbol to &copy;', () => {
			const input = '\u00A9 2024 Company';
			const expected = '&copy; 2024 Company';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert registered trademark symbol to &reg;', () => {
			const input = 'Product\u00AE';
			const expected = 'Product&reg;';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert degree symbol to &deg;', () => {
			const input = '25\u00B0C';
			const expected = '25&deg;C';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert plus-minus sign to &plusmn;', () => {
			const input = '5 \u00B1 0.1';
			const expected = '5 &plusmn; 0.1';
			strictEqual(stupefyText(input), expected);
		});

		test('should convert trademark symbol to &trade;', () => {
			const input = 'Brand\u2122';
			const expected = 'Brand&trade;';
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

	suite('removeEmoji function', () => {
		test('should remove basic emoji faces', () => {
			const input = 'Hello 😀 World 😊!';
			const expected = 'Hello  World !';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove various emoji categories', () => {
			const input = '⌚ Watch ⌨ Keyboard 🎅 Santa 🏂 Snowboard';
			const expected = ' Watch  Keyboard  Santa  Snowboard';
			strictEqual(removeEmoji(input), expected);
		});

		test('should preserve ASCII characters like # and *', () => {
			const input = '# Heading * List item ** Bold **';
			const expected = '# Heading * List item ** Bold **';
			strictEqual(removeEmoji(input), expected);
		});

		test('should preserve digits 0-9', () => {
			const input = '0123456789';
			const expected = '0123456789';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove emoji but keep regular punctuation', () => {
			const input = 'Hello! 👋 How are you? 🤔 I am fine. 😊';
			const expected = 'Hello!  How are you?  I am fine. ';
			strictEqual(removeEmoji(input), expected);
		});

		test('should handle text with no emoji', () => {
			const input = 'This is plain ASCII text with no emoji!';
			const expected = 'This is plain ASCII text with no emoji!';
			strictEqual(removeEmoji(input), expected);
		});

		test('should handle empty string', () => {
			strictEqual(removeEmoji(''), '');
		});

		test('should remove emoji at string boundaries', () => {
			const input = '😀Start and End😀';
			const expected = 'Start and End';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove consecutive emoji', () => {
			const input = 'Multiple 😀😊😎 emoji';
			const expected = 'Multiple  emoji';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove emoji from multiline text', () => {
			const input = 'Line 1 😀\nLine 2 🎉\nLine 3 ✨';
			const expected = 'Line 1 \nLine 2 \nLine 3 ';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove emoji flags', () => {
			const input = 'USA 🇺🇸 France 🇫🇷 Japan 🇯🇵';
			const expected = 'USA  France  Japan ';
			strictEqual(removeEmoji(input), expected);
		});

		test('should preserve copyright and trademark symbols when used as HTML entities', () => {
			// These are not emoji when written as &copy; etc
			const input = '&copy; 2024 &reg; &trade;';
			const expected = '&copy; 2024 &reg; &trade;';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove heart and symbol emoji', () => {
			// Note: ❤️ includes a variation selector which may not be fully removed
			const input = 'I ❤ coding! ✅ Done ❌ Not done';
			const expected = 'I  coding!  Done  Not done';
			strictEqual(removeEmoji(input), expected);
		});

		test('should handle mixed content with code blocks', () => {
			const input = '```\ncode here\n```\n😊 Text with emoji';
			const expected = '```\ncode here\n```\n Text with emoji';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove animal emoji', () => {
			const input = '🐶 Dog 🐱 Cat 🦁 Lion';
			const expected = ' Dog  Cat  Lion';
			strictEqual(removeEmoji(input), expected);
		});

		test('should remove food emoji', () => {
			const input = '🍕 Pizza 🍔 Burger 🍎 Apple';
			const expected = ' Pizza  Burger  Apple';
			strictEqual(removeEmoji(input), expected);
		});

		test('should handle surrogate pairs correctly', () => {
			// Note: Family emoji with ZWJ sequences may leave some joiners
			const input = 'Complex emoji: 👨👩👧👦 family';
			const expected = 'Complex emoji:  family';
			strictEqual(removeEmoji(input), expected);
		});

		test('should preserve markdown formatting', () => {
			const input = '**Bold** 😊 *Italic* 🎉 `code`';
			const expected = '**Bold**  *Italic*  `code`';
			strictEqual(removeEmoji(input), expected);
		});

		test('should preserve URLs', () => {
			const input = 'Visit https://example.com 😊 for more';
			const expected = 'Visit https://example.com  for more';
			strictEqual(removeEmoji(input), expected);
		});

		test('should handle text with both smart punctuation and emoji', () => {
			const input = '"Hello" — she said 😊';
			const expected = '"Hello" — she said ';
			strictEqual(removeEmoji(input), expected);
		});
	});

	suite('VS Code Command Integration', () => {
		test('should register commands on activation', () => {
			// Skip this test since it requires actual file system access
			// The commands are tested below by checking if they're registered
		});

		test('stupefy command should be registered with correct ID', async () => {
			const commands = await vscode.commands.getCommands();
			ok(commands.includes('markdown-stupefy.stupefy'));
		});

		test('removeEmoji command should be registered with correct ID', async () => {
			const commands = await vscode.commands.getCommands();
			ok(commands.includes('markdown-stupefy.removeEmoji'));
		});
	});
});
