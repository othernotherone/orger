/**
 * Simple test script to verify that the Orger parser is working correctly
 */
const fs = require('fs');
const path = require('path');
const { Parser } = require('../packages/core/src/parser/parser');
const { HtmlRenderer } = require('../packages/core/src/renderer/html');
const { MarkdownRenderer } = require('../packages/core/src/renderer/markdown');

// Sample Org Mode content
const orgContent = `
* Heading 1
Some text in the first heading with *bold*, /italic/, _underlined_, +strikethrough+ and ~code~ formatting.

** Heading 1.1
More text in a subheading with **bold**, /italic text/, and =verbatim= content.

* Heading 2
Text in the second heading.

* Lists
** Unordered Lists
- Item 1
- Item 2
  - Nested item 2.1
    - Nested item 2.1.1
- Item 3

** Ordered Lists
1. First item
2. Second item
   1. Nested item 2.1
      1. Nested item 2.1.1
3. Third item

** Task Lists
- [ ] Unchecked task
- [X] Checked task
- [-] In progress task

* TODO Tasks and Projects
** TODO Write documentation
Need to document the API and provide examples.

** DONE Implement basic parser
The basic parser is now working with support for headings, paragraphs, and formatting.

** PROJECT Improve test coverage
This is a larger project that will take some time.

** IDEA Add support for tables
It would be nice to add support for tables in the future.

** FEEDBACK Review code structure
Waiting for feedback on the current code structure.
`;

/**
 * Custom serializer function to handle circular references in the AST
 * @param {Object} node The node to serialize
 * @returns {Object} A serializable object
 */
function serializeNode(node) {
  if (!node) return null;
  
  const result = {
    type: node.type
  };
  
  // Copy properties except parent and children
  Object.keys(node).forEach(key => {
    if (key !== 'parent' && key !== 'children') {
      result[key] = node[key];
    }
  });
  
  // Recursively serialize children
  if (node.children && Array.isArray(node.children)) {
    result.children = node.children.map(serializeNode);
  }
  
  return result;
}

console.log('Testing Orger parser...');

try {
  // Parse the content
  const parser = new Parser();
  const document = parser.parse(orgContent);
  
  console.log('✅ Parsing successful!');
  
  // Serialize the document for display
  const serializedDoc = serializeNode(document);
  console.log('\nDocument structure:');
  console.log(JSON.stringify(serializedDoc, null, 2));
  
  // Render to HTML
  const htmlRenderer = new HtmlRenderer();
  const html = htmlRenderer.render(document, { pretty: true });
  
  console.log('\n✅ HTML rendering successful!');
  console.log('\nHTML output:');
  console.log(html);
  
  // Render to Markdown
  const markdownRenderer = new MarkdownRenderer();
  const markdown = markdownRenderer.render(document, { pretty: true });
  
  console.log('\n✅ Markdown rendering successful!');
  console.log('\nMarkdown output:');
  console.log(markdown);
  
  // Save outputs to files
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  fs.writeFileSync(path.join(outputDir, 'test-output.html'), html);
  fs.writeFileSync(path.join(outputDir, 'test-output.md'), markdown);
  fs.writeFileSync(path.join(outputDir, 'test-output.json'), JSON.stringify(serializedDoc, null, 2));
  
  console.log('\nOutput files saved to examples/output/ directory.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 