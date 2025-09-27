# Changelog

## 0.5.2

### Maintenance

Updated development tooling dependencies to the latest compatible
patch versions (#34), including:

- `eslint` 9.36.0
- `esbuild` 0.25.10
- `@typescript-eslint/eslint-plugin` 8.44.1
- `@typescript-eslint/parser` 8.44.1

Also refreshed the VS Code type definitions to 1.104.0.

## 0.5.1

### Maintenance

- Added script `scripts/banner.sh` to generate the README banner image (#31).
- Refined `@types/node` version range (replacing `16.x`) for consistency and
  upgraded `@typescript-eslint/*` packages (#30).

## 0.5.0

### Improvements

- Added support for converting two-em dash (`U+2E3A`), three-em dash (`U+2E3B`),
  and bullet (`U+2022`) to their ASCII equivalents (#26).
  Remove the object replacement character (`U+FFFC`) (#28).

## 0.4.3

### Maintenance

- Update dependency versions (#25).
- Replace `CLAUDE.md` with `AGENTS.md` (#22).

## 0.4.2

### Improvements

- Added support for converting less-than or equal to (`U+2264`) and
  greater-than or equal to (`U+2265`) symbols to their ASCII equivalents
  `<=` and `>=` in the stupefy command.

## 0.4.1

### Maintenance

- Updated development Node.js dependencies to the latest versions (#16).

## 0.4.0

### New features

- Added support for VS Code Web Extensions, enabling the extension to run in
  browser-based environments like github.dev and vscode.dev (#15).
  - Refactored extension architecture to embed emoji data directly in
    TypeScript code for web compatibility, eliminating file system dependencies.
  - Updated build pipeline to generate both Node.js and browser targets from a
    single codebase.
  - Converted emoji data from JSONL to TypeScript format with human-readable
    comments showing Unicode hex codes and sample characters.

## 0.3.2

### Improvements

- Convert non-breaking hyphens (U+2011) to regular hyphens in the
  "Stupefy: Convert Smart Punctuation to ASCII" command (#14).

## 0.3.1

### Documentation

- Added a demo GIF to the README to showcase the extension's functionality
  and usage (#13).

## 0.3.0

### New features

- Added a new command "Stupefy: Cleanup Trailing Whitespace and End of File"
  to remove trailing whitespace and ensure a single newline at the
  end of the file (#12).

## 0.2.1

### Bug fixes

- Fixed an issue where the incorrect emoji data path prevents all commands
  from working in the published extension (#9).

## 0.2.0

### New features

- Added new command "Stupefy: Remove Emoji Characters" to remove all emojis
  from the current document (#7).

### Improvements

- Lowered the minimum required VS Code version to 1.78.0 (April 2023)
  to support more users (#6, #7).

## 0.1.0

### New features

- Initial release of the extension.
- Convert with a single command accessible via Command Palette:
  "Stupefy: Convert Smart Punctuation to ASCII".
- Works on entire active document.
- Support for common smart characters including:
  - Curly quotes (single and double).
  - Em dashes and en dashes.
  - Ellipsis.
  - Double angle quotation marks.
  - Left and right arrow.
  - Copyright symbol, registered trademark symbol, degree symbol,
    plus-minus sign, and trademark symbol.
