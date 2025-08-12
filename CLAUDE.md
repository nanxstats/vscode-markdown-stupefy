# Markdown Stupefy Extension

## Project overview

VS Code extension that implements "stupefy mode" - converting smart typography
(curly quotes, em-dashes, etc.) back to ASCII equivalents. Based on the reverse
transformation concept from John Gruber's original SmartyPants tool.

## Architecture

### Core components

- `extension.ts`: Main extension entry point containing:
  - `STUPEFY_REPLACEMENTS`: Map of Unicode to ASCII character mappings
  - `stupefyText()`: Core transformation function
  - `activate()`: Extension activation and command registration
  - Command handler for the stupefy operation

### Character Replacements

The extension replaces the Unicode characters with ASCII equivalents
defined in the `STUPEFY_REPLACEMENTS` map.

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
2. Open any text file with smart typography
3. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
4. Run "Stupefy: Convert Smart Punctuation to ASCII"
5. Verify all smart characters are converted

### Adding new character replacements

1. Add new entry to `STUPEFY_REPLACEMENTS` Map in src/extension.ts:
   ```typescript
   ['\uXXXX', 'replacement'],  // description
   ```
2. Use Unicode escape sequences for special characters
3. Test thoroughly with sample text

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
├── dist/
│   └── extension.js           # Bundled output
├── out/                       # Compiled test files (generated)
├── package.json               # Extension manifest and dependencies
├── tsconfig.json              # TypeScript configuration
├── esbuild.js                 # Build configuration
├── eslint.config.mjs          # Linting configuration
└── .vscode-test.mjs           # VS Code test configuration
```

## Key commands

- **Command ID**: `markdown-stupefy.stupefy`
- **Command Title**: "Stupefy: Convert Smart Punctuation to ASCII"
- **Activation**: On first command execution

## Best practices

1. Always use Unicode escape sequences for non-ASCII characters in code
2. Test with various document types (Markdown, plain text, code files)
3. Ensure no unintended replacements in code blocks or URLs
4. Keep replacement logic simple and predictable
5. Follow KISS principle - avoid over-engineering

## Future enhancements (if needed)

- Configuration for custom replacement rules
- Ability to stupefy selected text only
- Preserve certain characters based on context
- Undo-aware batch operations
