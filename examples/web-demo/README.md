# Orger Web Demo

This is a simple web demo for the Orger parser. It allows you to parse Org Mode text and see the resulting HTML, Markdown, and AST.

## Running the Demo

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

This will open the demo in your default browser.

## How to Use

1. Enter Org Mode text in the input panel on the left
2. Click the "Parse" button to parse the text
3. View the results in the output panel on the right
   - HTML tab: Shows the rendered HTML
   - Markdown tab: Shows the converted Markdown
   - AST tab: Shows the Abstract Syntax Tree as JSON

## Features Demonstrated

- Parsing Org Mode text
- Rendering to HTML
- Converting to Markdown
- Viewing the AST

## Implementation Details

The demo uses the `@orger/core` package to parse and render Org Mode text. It loads the package from a CDN (unpkg) and uses the browser-compatible UMD bundle. 