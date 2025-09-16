#!/bin/bash

set -euo pipefail

COLOR="#B22222"
BANNER_WIDTH=7617
BANNER_HEIGHT=2158
FRAME_STROKE=180
FRAME_RADIUS=260
LOGO_SIZE=768
TEXT="Markdown Stupefy"
TEXT_POINT_SIZE=700
TEXT_FONT="Instrument-Serif-Italic"
LOGO_PATH="assets/logo.png"
OUTPUT_PATH="assets/banner.png"

# Validate dependencies
if ! command -v magick >/dev/null 2>&1; then
	echo "ImageMagick (magick) is required to generate the banner" >&2
	exit 1
fi

if ! command -v pngquant >/dev/null 2>&1; then
	echo "pngquant is required to optimize the resulting PNG" >&2
	exit 1
fi

if [ ! -f "$LOGO_PATH" ]; then
	echo "Logo not found at $LOGO_PATH. Run scripts/logo.sh first." >&2
	exit 1
fi

# Derived geometry
FRAME_INSET=$((FRAME_STROKE / 2))
LOGO_CENTER_X=$(awk -v w="$BANNER_WIDTH" 'BEGIN { printf "%d", w * 0.16 }')
LOGO_CENTER_Y=$(awk -v h="$BANNER_HEIGHT" 'BEGIN { printf "%d", h * 0.47 }')
LOGO_OFFSET_X=$((LOGO_CENTER_X - (LOGO_SIZE / 2)))
LOGO_OFFSET_Y=$((LOGO_CENTER_Y - (LOGO_SIZE / 2)))
TEXT_BASELINE_X=$(awk -v w="$BANNER_WIDTH" 'BEGIN { printf "%d", w * 0.26 }')
TEXT_BASELINE_Y=$((LOGO_CENTER_Y - 400))
FRAME_MAX_X=$((BANNER_WIDTH - FRAME_INSET - 1))
FRAME_MAX_Y=$((BANNER_HEIGHT - FRAME_INSET - 1))

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

BASE_IMAGE="$WORK_DIR/banner-base.png"
LOGO_RESIZED="$WORK_DIR/logo-resized.png"
RAW_BANNER="$WORK_DIR/banner-raw.png"

# Create base canvas with rounded frame
magick -size "${BANNER_WIDTH}x${BANNER_HEIGHT}" xc:none \
	-strokewidth "$FRAME_STROKE" \
	-stroke "$COLOR" \
	-fill none \
	-draw "roundrectangle ${FRAME_INSET},${FRAME_INSET} ${FRAME_MAX_X},${FRAME_MAX_Y} ${FRAME_RADIUS},${FRAME_RADIUS}" \
	"$BASE_IMAGE"

# Resize logo for banner composition
magick "$LOGO_PATH" -resize "${LOGO_SIZE}x${LOGO_SIZE}" "$LOGO_RESIZED"

# Composite logo onto banner
magick "$BASE_IMAGE" "$LOGO_RESIZED" \
	-gravity northwest \
	-geometry "+${LOGO_OFFSET_X}+${LOGO_OFFSET_Y}" \
	-composite \
	"$RAW_BANNER"

# Annotate text
magick "$RAW_BANNER" \
	-fill "$COLOR" \
	-font "$TEXT_FONT" \
	-pointsize "$TEXT_POINT_SIZE" \
	-gravity northwest \
	-annotate "+${TEXT_BASELINE_X}+${TEXT_BASELINE_Y}" "$TEXT" \
	"$RAW_BANNER"

mkdir -p "$(dirname "$OUTPUT_PATH")"

# Optimize and write final banner
magick "$RAW_BANNER" -strip PNG32:- |
	pngquant --force --output "$OUTPUT_PATH" -

echo "Banner generated successfully at $OUTPUT_PATH"
