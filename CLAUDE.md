# Markdown Stupefy Extension

## Project overview

VS Code extension that implements "stupefy mode" - converting Markdown
smart punctuation (curly quotes, em-dashes, etc.) back to ASCII equivalents,
and removing emoji characters from text.
Based on the reverse transformation concept from the original SmartyPants tool
written by John Gruber.

## Architecture

### Core components

- `extension.ts`: Main extension entry point containing:
  - `STUPEFY_REPLACEMENTS`: Map of Unicode to ASCII character mappings
  - `stupefyText()`: Core transformation function for smart punctuation
  - `removeEmoji()`: Function to remove emoji characters from text
  - `cleanupWhitespace()`: Function to clean up trailing whitespace and ensure single newline at EOF
  - `loadEmojiData()`: Loads emoji codepoints from JSONL data file
  - `activate()`: Extension activation and command registration
  - Command handlers for stupefy, emoji removal, and whitespace cleanup operations
- `assets/emoji-data.jsonl`: Human-readable database of emoji codepoints from Unicode standard
- `scripts/`: Build scripts for updating emoji data:
  - `update_emoji_data.sh`: Downloads latest Unicode emoji data
  - `parse-emoji-data.js`: Parses and filters emoji data into JSONL format

### Character replacements

The extension replaces Unicode characters with ASCII equivalents
defined in the `STUPEFY_REPLACEMENTS` map.

### Emoji removal

The emoji removal feature removes emoji characters while preserving:

- ASCII characters (including `#`, `*`, digits 0-9)
- Regular punctuation and symbols
- Markdown formatting
- URLs and code blocks

Emoji data is sourced from the Unicode Technical Report and filtered to exclude
characters that are primarily used as text (arrows, copyright symbols, etc.).

### Whitespace cleanup

The whitespace cleanup feature:

- Removes trailing whitespace from the end of each line
- Ensures exactly one newline character at the end of the file
- Preserves line endings within the document
- Helps maintain clean, consistent formatting

## Coding standards

### TypeScript guidelines

- Use Unicode escape sequences (`\uXXXX`) for non-ASCII characters in string literals
- Type all function parameters and return values explicitly
- Use `const` for immutable values, `let` for mutable ones
- Follow VS Code API conventions for command handlers

### Code style

- Use tabs for indentation (VS Code standard)
- Keep functions focused and single-purpose
- Use descriptive variable names
- Add inline comments only for complex logic

### Error handling

- Check for active editor before operations
- Provide clear user feedback via `vscode.window.showInformationMessage` and `showErrorMessage`
- Handle edge cases (no active editor, no changes needed)

## Development workflow

### Building

```bash
# Install dependencies
npm install

# Type checking
npm run check-types

# Linting
npm run lint

# Build with esbuild
node esbuild.js

# Watch mode for development
npm run watch
```

### Testing

#### Running unit tests

```bash
# Compile test files
npm run compile-tests

# Run all tests
npm test

# For continuous testing during development
npm run watch-tests
```

#### Manual testing

1. Press F5 in VS Code to launch Extension Development Host
2. Open any text file with smart punctuation, emoji, or trailing whitespace
3. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
4. Run "Stupefy: Convert Smart Punctuation to ASCII" to convert smart quotes
5. Run "Stupefy: Remove Emoji Characters" to remove emoji
6. Run "Stupefy: Clean Up Whitespace" to clean trailing spaces and normalize EOF
7. Verify conversions work correctly and preserve important text

### Adding new character replacements

1. Add new entry to `STUPEFY_REPLACEMENTS` Map in src/extension.ts:
   ```typescript
   ['\uXXXX', 'replacement'],  // description
   ```
2. Use Unicode escape sequences for special characters
3. Test thoroughly with sample text

### Updating emoji data

1. Run the update script to get the latest Unicode data:
   ```bash
   sh scripts/update_emoji_data.sh
   ```
2. The script downloads and parses the latest emoji data from unicode.org
3. Review the generated `assets/emoji-data.jsonl` for accuracy
4. Rebuild the extension to include updated data

## File structure

```
/
├── src/
│   ├── extension.ts           # Main extension code
│   └── test/
│       ├── extension.test.ts  # Unit and integration tests
│       ├── runTest.ts         # Test runner entry point
│       └── suite/
│           └── index.ts       # Test suite configuration
├── scripts/
│   ├── update_emoji_data.sh   # Downloads latest Unicode emoji data
│   └── parse-emoji-data.js    # Parses emoji data into JSONL format
├── assets/
│   ├── emoji-data.jsonl       # Emoji codepoint database (human-readable)
├── dist/
│   ├── extension.js           # Bundled output
├── out/                       # Compiled test files (generated)
├── package.json               # Extension manifest and dependencies
├── tsconfig.json              # TypeScript configuration
├── esbuild.js                 # Build configuration with emoji data copy plugin
├── eslint.config.mjs          # Linting configuration
└── .vscode-test.mjs           # VS Code test configuration
```

## Key commands

- **Command ID**: `markdown-stupefy.stupefy`
- **Command Title**: "Stupefy: Convert Smart Punctuation to ASCII"
- **Command ID**: `markdown-stupefy.removeEmoji`
- **Command Title**: "Stupefy: Remove Emoji Characters"
- **Command ID**: `markdown-stupefy.cleanupWhitespace`
- **Command Title**: "Stupefy: Clean Up Whitespace"
- **Activation**: On first command execution

## Best practices

1. Always use Unicode escape sequences for non-ASCII characters in code
2. Test with various document types (Markdown, plain text, code files)
3. Ensure no unintended replacements in code blocks or URLs
4. Keep replacement logic simple and predictable
5. Follow KISS principle - avoid over-engineering
6. When updating emoji data, verify that ASCII characters are not incorrectly classified as emoji
7. Test emoji removal with complex emoji sequences (flags, family emoji, etc.)
8. Ensure the JSONL format remains human-readable for debugging
9. Test whitespace cleanup to ensure it preserves document structure
10. Verify EOF normalization works correctly across different file types

## Future enhancements (if needed)

- Configuration for custom replacement rules
- Ability to stupefy or remove emoji from selected text only
- Undo-aware batch operations
- Support for additional Unicode character categories
