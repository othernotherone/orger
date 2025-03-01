# Orger Examples

This directory contains examples of how to use the Orger parser and renderer.

## Contents

- `sample.org`: A sample Org Mode file demonstrating various Org Mode features
- `api-usage.js`: A Node.js script demonstrating how to use the Orger API
- `run-example.sh`: A shell script to run the API usage example
- `web-demo/`: A web-based demo of the Orger parser

## Running the Examples

### API Usage Example

To run the API usage example:

```bash
# Make the script executable if needed
chmod +x run-example.sh

# Run the example
./run-example.sh
```

This will:
1. Build the Orger packages
2. Run the API usage example
3. Open the generated HTML output in your default browser

### Web Demo

To run the web demo:

```bash
cd web-demo
npm install
npm start
```

This will start a local web server and open the demo in your default browser.

## Example Outputs

The API usage example generates the following outputs:

- `output.html`: The sample Org Mode file rendered as HTML
- `output.md`: The sample Org Mode file converted to Markdown
- `output-custom.html`: The sample Org Mode file rendered as HTML with a custom plugin

## Learning from the Examples

These examples demonstrate:

1. How to parse Org Mode text
2. How to access and manipulate the AST
3. How to render Org Mode to HTML and Markdown
4. How to create and use custom plugins
5. How to use the Orger API in both Node.js and browser environments 