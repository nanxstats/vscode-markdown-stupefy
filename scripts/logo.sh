#!/bin/bash

# Exit on error
set -e

# Define Chrome binary path
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Download SVG
echo "Downloading SVG from Phosphor Icons..."
curl -s -o lightning-a.svg https://raw.githubusercontent.com/phosphor-icons/core/refs/heads/main/assets/regular/lightning-a.svg

# Replace fill color
echo "Modifying SVG color..."
awk '{gsub(/fill="currentColor"/, "fill=\"#B22222\""); print}' lightning-a.svg >lightning-a-modified.svg
mv lightning-a-modified.svg lightning-a.svg

# Convert SVG to PDF
echo "Converting SVG to PDF..."
"$CHROME_BIN" --headless \
        --disable-gpu \
        --no-margins \
        --no-pdf-header-footer \
        --print-to-pdf-no-header \
        --print-to-pdf=logo.pdf \
        lightning-a.svg

# Crop PDF
echo "Cropping PDF..."
pdfcrop --quiet logo.pdf logo.pdf

# Convert PDF to PNG
echo "Converting PDF to PNG..."
magick -density 300 logo.pdf -background transparent -resize 512x512 -gravity center -extent 512x512 logo.png

# Optimize PNG
echo "Optimizing PNG..."
pngquant logo.png --force --output logo.png

# Create assets directory
mkdir -p assets

# Move PNG to assets
echo "Moving logo to assets..."
mv logo.png assets/logo.png

# Clean up intermediate files
echo "Cleaning up..."
rm -f lightning-a.svg logo.pdf

echo "Logo generated successfully"
