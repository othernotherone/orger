import { Parser } from '../packages/core/src/parser/parser';

// Sample with just strikethrough
const orgContent = `
This is a test with +strikethrough+ text.
`;

console.log('Testing strikethrough parsing...');

try {
  // Parse the content
  const parser = new Parser();
  const document = parser.parse(orgContent);
  
  // Print the document structure
  console.log(JSON.stringify(document, (key, value) => {
    if (key === 'parent') return undefined; // Avoid circular references
    return value;
  }, 2));
  
} catch (error) {
  console.error('Error:', error);
}
