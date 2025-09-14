# AGENTS.md

## Project overview

- Converts smart punctuation to ASCII (stupefy mode).
- Removes emoji characters while preserving Markdown, ASCII, and URLs.
- Cleans trailing whitespace and enforces exactly one newline at EOF.

## Scope for agents

- Implement and refine smart punctuation mappings and whitespace cleanup.
- Update emoji data generation and usage while preserving web compatibility.
- Improve tests, docs, and build tooling as needed to support the above.
- Avoid unrelated refactors and dependency churn.

## Repo map

- `src/extension.ts`: Core logic and command registrations.
- `src/emoji-data.ts`: Auto-generated emoji ranges for web compatibility.
- `src/test/extension.test.ts`: Unit/integration tests for core functions and command IDs.
- `scripts/update_emoji_data.sh`: Downloads Unicode emoji data and regenerates TypeScript data file.
- `scripts/parse-emoji-data.js`: Parses Unicode data and emits human-readable `emoji-data.ts`.
- `esbuild.js`: Bundles for Node (desktop) and browser (web) targets.
- `package.json`: Commands, contributions, and VS Code engine/browser targets.

## Key commands (VS Code)

- `markdown-stupefy.stupefy`: Stupefy smart punctuation to ASCII.
- `markdown-stupefy.removeEmoji`: Remove emoji characters.
- `markdown-stupefy.cleanupWhitespace`: Trim trailing whitespace, normalize EOF.

## Development workflow

- Install: `npm install`
- Type check: `npm run check-types`
- Lint: `npm run lint`
- Build (both targets): `node esbuild.js` (use `--production` via `npm run package` when needed)
- Watch: `npm run watch`
- Tests: `npm run compile-tests` then `npm test` (or `npm run watch-tests`)

Outputs:

- Desktop (Node): `dist/extension.js`
- Web (browser): `dist/web/extension.js`

## Implementation guidelines

- TypeScript: Explicit types for params/returns; `const` by default; `let` when needed.
- Unicode in code: Use `\uXXXX` escapes for non-ASCII in string literals.
- Style: Tabs for indentation, small focused functions, clear names, minimal inline comments (only for nontrivial logic).
- Error handling: Always check for active editor. Use `vscode.window.showInformationMessage` / `showErrorMessage` for user feedback. Exit gracefully when no changes are required.
- Web compatibility: Do not add Node-specific APIs (`fs`, `path`, etc.) in extension code. Emoji ranges are embedded in TypeScript to avoid file I/O.
- Replacement rules: Extend the `STUPEFY_REPLACEMENTS` Map in `src/extension.ts`. Keep behavior simple and predictable.
- Emoji removal: Preserve ASCII, punctuation, Markdown formatting, code blocks, and URLs. Complex sequences (flags, family) should be removed as a unit when possible.
- Whitespace cleanup: Remove trailing whitespace per line and ensure exactly one final newline; preserve internal line breaks.

## How to update emoji data

- Run: `sh scripts/update_emoji_data.sh` to fetch and regenerate `src/emoji-data.ts` with human-readable comments.
- Verify: Rebuild and run tests. Ensure ASCII and text-like symbols (e.g., arrows, &copy;, &reg;, &trade;) are not misclassified as emoji.
- Do not manually edit `src/emoji-data.ts`; regenerate via the script for consistency and traceability.

## Testing expectations

- Unit/integration tests live in `src/test/extension.test.ts`.
- When adding mappings or logic, add corresponding tests covering typical usage and edge cases.
- Before handing off, ensure: `npm run check-types`, `npm run lint`, and `npm test` succeed.

## Dependency management

- Update cautiously. Keep VS Code-related versions pinned for compatibility:
  - `@types/vscode`: `^1.78.0`
  - `engines.vscode`: `^1.78.0`
- General process: `npm outdated` -> update selectively in `package.json` -> `npm install` -> `npm run check-types` -> `npm run lint` -> `npm test`.

## Definition of done

- Behavior: Meets the request without regressions to stupefying, emoji removal, or whitespace cleanup.
- Quality: Types, lint, build, and tests all pass for both Node and web targets.
- Scope: Changes are minimal, focused, and consistent with existing patterns.
- Docs: Update `AGENTS.md` and `README.md` only if user-facing behavior or workflows change.

## What to avoid

- Introducing Node-only APIs or file access in extension runtime code.
- Changing command IDs or activation model without explicit request.
- Over-broad replacements that affect code blocks, URLs, or ASCII content.
- Large refactors or unrelated formatting churn.

## Agent operating notes

- File edits: Keep patches minimal and targeted. Update only what's required for the task.
- Tests first: Prefer adding/changing tests closest to the logic you touch.
- Validation: Use the provided npm scripts to type-check, lint, build, and test.
- Communication (for interactive agents): Ask clarifying questions on ambiguity; summarize plan and progress succinctly; propose next steps when appropriate.

## Manual testing checklist

- Launch Extension Development Host (F5).
- Run commands via Command Palette:
  - Stupefy smart punctuation and confirm ASCII output.
  - Remove emoji and confirm Markdown/URLs/code blocks are preserved.
  - Clean whitespace and confirm only trailing whitespace is removed, with one final newline.

## Future enhancements (optional)

- Customizable replacement rules.
- Selection-aware operations (act on selected text only).
- Undo-aware, batch-friendly workflows.
- Additional Unicode categories as needed.
