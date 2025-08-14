#!/bin/bash

# Download and parse Unicode emoji data
# Output: src/emoji-data.jsonl with emoji codepoints in human-readable format

set -e

EMOJI_DATA_URL="https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt"
TEMP_FILE="emoji-data-temp.txt"
OUTPUT_FILE="../src/emoji-data.jsonl"

cd "$(dirname "$0")"

echo "Downloading emoji data from Unicode..."
curl -s "$EMOJI_DATA_URL" -o "$TEMP_FILE"

echo "Parsing emoji data..."
node parse-emoji-data.js "$TEMP_FILE" "$OUTPUT_FILE"

# Clean up
rm -f "$TEMP_FILE"

echo "Emoji data saved to $OUTPUT_FILE"
