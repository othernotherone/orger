import { Parser } from './parser';
import * as ast from '../ast';

describe('Parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  test('should parse a simple document', () => {
    const input = `#+TITLE: Test Document
#+AUTHOR: Test Author

* Heading 1
Some content

** Heading 1.1
More content

* Heading 2
- List item 1
- List item 2
  - Nested list item
`;

    const result = parser.parse(input);

    // Check document properties
    expect(result.type).toBe('document');
    expect(result.properties.TITLE).toBe('Test Document');
    expect(result.properties.AUTHOR).toBe('Test Author');

    // Check sections
    expect(result.children.length).toBe(2);
    
    // Check first section
    const section1 = result.children[0];
    expect(section1.type).toBe('section');
    expect(section1.heading?.level).toBe(1);
    expect(section1.heading?.title).toBe('Heading 1');
    
    // Check subsection
    expect(section1.children.length).toBe(2);
    expect(section1.children[0].type).toBe('paragraph');
    expect(section1.children[1].type).toBe('section');
    
    const subsection = section1.children[1] as ast.Section;
    expect(subsection.heading?.level).toBe(2);
    expect(subsection.heading?.title).toBe('Heading 1.1');
    
    // Check second section
    const section2 = result.children[1];
    expect(section2.type).toBe('section');
    expect(section2.heading?.level).toBe(1);
    expect(section2.heading?.title).toBe('Heading 2');
    
    // Check list
    expect(section2.children.length).toBe(1);
    expect(section2.children[0].type).toBe('list');
    
    const list = section2.children[0] as ast.List;
    expect(list.ordered).toBe(false);
    expect(list.items.length).toBe(2);
  });

  test('should parse TODO items', () => {
    const input = `* TODO Task 1
* DONE Task 2`;

    const result = parser.parse(input);

    expect(result.children.length).toBe(2);
    
    const section1 = result.children[0];
    expect(section1.heading?.todoKeyword).toBe('TODO');
    expect(section1.heading?.title).toBe('Task 1');
    
    const section2 = result.children[1];
    expect(section2.heading?.todoKeyword).toBe('DONE');
    expect(section2.heading?.title).toBe('Task 2');
  });

  test('should parse tags', () => {
    const input = `* Heading with tags :tag1:tag2:`;

    const result = parser.parse(input);

    expect(result.children.length).toBe(1);
    
    const section = result.children[0];
    expect(section.heading?.tags).toEqual(['tag1', 'tag2']);
  });

  test('should parse code blocks', () => {
    const input = `#+BEGIN_SRC javascript
function hello() {
  return 'world';
}
#+END_SRC`;

    const result = parser.parse(input);

    expect(result.children.length).toBe(1);
    expect(result.children[0].children.length).toBe(1);
    
    const codeBlock = result.children[0].children[0] as ast.CodeBlock;
    expect(codeBlock.type).toBe('code_block');
    expect(codeBlock.language).toBe('javascript');
    expect(codeBlock.value).toBe(`function hello() {
  return 'world';
}`);
  });
}); 