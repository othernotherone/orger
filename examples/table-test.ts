/**
 * Test file for table parsing in Orger
 */
import * as fs from 'fs';
import * as path from 'path';
import { Parser } from '../packages/core/src/parser/parser';
import { HtmlRenderer } from '../packages/core/src/renderer/html';
import { MarkdownRenderer } from '../packages/core/src/renderer/markdown';
import { OrgRenderer } from '../packages/core/src/renderer/org';

// Sample Org Mode content with tables
const orgContent = `
* Tables in Org Mode

Simple table:

| Name  | Age | City    |
|-------+-----+---------|
| Alice | 25  | New York|
| Bob   | 30  | London  |
| Carol | 28  | Tokyo   |

Table without header:

| Item 1 | Description 1 |
| Item 2 | Description 2 |
| Item 3 | Description 3 |

Table with alignment:

| Left   |  Center  |   Right |
|--------+----------+---------|
| L1     |    C1    |      R1 |
| Long L | Center C | Short R |
`;

/**
 * Custom serializer function to handle circular references in the AST
 * @param node The node to serialize
 * @returns A serializable object
 */
function serializeNode(node: any): any {
  if (!node) return null;
  
  const result: any = {
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

console.log('Testing Orger table parsing...');

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
  
  // Render to Org Mode
  const orgRenderer = new OrgRenderer();
  const org = orgRenderer.render(document);
  
  console.log('\n✅ Org Mode rendering successful!');
  console.log('\nOrg Mode output:');
  console.log(org);
  
  // Save outputs to files
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  fs.writeFileSync(path.join(outputDir, 'table-test-output.html'), html);
  fs.writeFileSync(path.join(outputDir, 'table-test-output.md'), markdown);
  fs.writeFileSync(path.join(outputDir, 'table-test-output.org'), org);
  fs.writeFileSync(path.join(outputDir, 'table-test-output.json'), JSON.stringify(serializedDoc, null, 2));
  
  console.log('\nOutput files saved to examples/output/ directory.');
  
} catch (error) {
  console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
} 