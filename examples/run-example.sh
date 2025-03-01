#!/bin/bash

# Build the packages
echo "Building packages..."
cd "$(dirname "$0")/.."
npm run build

# Run the example
echo "Running example..."
cd examples
node api-usage.js

# Open the HTML output
echo "Opening HTML output..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open output.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open output.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start output.html
else
  echo "Please open output.html manually"
fi

echo "Done!" 