/**
 * Example script demonstrating how to use the Orger API
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('@orger/core');
const { HtmlRenderer } = require('@orger/core/dist/renderer/html');
const { MarkdownRenderer } = require('@orger/core/dist/renderer/markdown');

// Read the sample Org Mode file
const orgContent = fs.readFileSync(path.join(__dirname, 'sample.org'), 'utf8');

// Parse the Org Mode content
console.log('Parsing Org Mode content...');
const document = parse(orgContent);

// Print document properties
console.log('\nDocument Properties:');
console.log(`Title: ${document.getTitle()}`);
console.log(`Author: ${document.getAuthor()}`);
console.log(`Date: ${document.getDate()}`);

// Find all headings
console.log('\nHeadings:');
const headings = document.findAll('heading');
headings.forEach(heading => {
  const indent = '  '.repeat(heading.level - 1);
  console.log(`${indent}${heading.title} (Level ${heading.level})`);
});

// Find all TODO items
console.log('\nTODO Items:');
const todoItems = document.findAll('heading').filter(h => h.todoKeyword === 'TODO');
todoItems.forEach(todo => {
  console.log(`- ${todo.title}`);
});

// Render to HTML
console.log('\nRendering to HTML...');
const htmlRenderer = new HtmlRenderer();
const html = htmlRenderer.render(document, { fullDocument: true });
fs.writeFileSync(path.join(__dirname, 'output.html'), html);
console.log('HTML output written to output.html');

// Render to Markdown
console.log('\nRendering to Markdown...');
const mdRenderer = new MarkdownRenderer();
const markdown = mdRenderer.render(document, { frontmatter: true });
fs.writeFileSync(path.join(__dirname, 'output.md'), markdown);
console.log('Markdown output written to output.md');

// Example of using a custom plugin
console.log('\nUsing a custom plugin...');
const customPlugin = {
  name: 'highlight-keywords',
  initialize: () => console.log('Plugin initialized'),
  processors: [
    {
      nodeType: 'text',
      process: (node) => {
        if (node.value && typeof node.value === 'string') {
          // Highlight specific keywords by adding a custom property
          const keywords = ['important', 'critical', 'urgent'];
          keywords.forEach(keyword => {
            if (node.value.toLowerCase().includes(keyword.toLowerCase())) {
              node.highlighted = true;
            }
          });
        }
        return node;
      }
    }
  ],
  renderers: [
    {
      format: 'html',
      render: (node, renderer) => {
        if (node.type === 'text' && node.highlighted) {
          return `<span class="highlight">${node.value}</span>`;
        }
        return null; // Let the default renderer handle it
      }
    }
  ]
};

// Parse with the custom plugin
const documentWithPlugin = parse(orgContent, { plugins: [customPlugin] });

// Create a custom HTML renderer that uses the plugin
const customHtmlRenderer = new HtmlRenderer();
const customHtml = customHtmlRenderer.render(documentWithPlugin);
fs.writeFileSync(path.join(__dirname, 'output-custom.html'), customHtml);
console.log('Custom HTML output written to output-custom.html');

console.log('\nDone!'); 