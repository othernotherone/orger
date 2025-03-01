import { HtmlRenderer } from './html-renderer';
import * as ast from '../ast';

describe('HtmlRenderer', () => {
  let renderer: HtmlRenderer;

  beforeEach(() => {
    renderer = new HtmlRenderer();
  });

  test('should render a simple document', () => {
    const document = ast.createDocument({
      TITLE: 'Test Document',
      AUTHOR: 'Test Author',
    });

    // Create a section with a heading
    const section = ast.createSection(
      ast.createHeading(1, 'Heading 1')
    );

    // Add a paragraph to the section
    const paragraph = ast.createParagraph();
    paragraph.children.push(ast.createText('This is a paragraph.'));
    section.children.push(paragraph);

    // Add the section to the document
    document.children.push(section);

    const html = renderer.render(document);

    // Check that the HTML contains the expected elements
    expect(html).toContain('<h1 class="org-title">Test Document</h1>');
    expect(html).toContain('<p class="org-author">Test Author</p>');
    expect(html).toContain('<h2 class="org-heading" id="heading-1">Heading 1</h2>');
    expect(html).toContain('<p class="org-paragraph">This is a paragraph.</p>');
  });

  test('should render formatted text', () => {
    const document = ast.createDocument();
    const section = ast.createSection();
    const paragraph = ast.createParagraph();

    // Create formatted text nodes
    const bold = ast.createFormattedText('bold');
    bold.children.push(ast.createText('Bold text'));

    const italic = ast.createFormattedText('italic');
    italic.children.push(ast.createText('Italic text'));

    // Add formatted text to paragraph
    paragraph.children.push(bold);
    paragraph.children.push(ast.createText(' and '));
    paragraph.children.push(italic);

    // Add paragraph to section, section to document
    section.children.push(paragraph);
    document.children.push(section);

    const html = renderer.render(document);

    // Check that the HTML contains the expected elements
    expect(html).toContain('<strong class="org-bold">Bold text</strong>');
    expect(html).toContain('<em class="org-italic">Italic text</em>');
  });

  test('should render lists', () => {
    const document = ast.createDocument();
    const section = ast.createSection();
    
    // Create an unordered list
    const list = ast.createList(false);
    
    // Create list items
    const item1 = ast.createListItem('- ');
    const para1 = ast.createParagraph();
    para1.children.push(ast.createText('Item 1'));
    item1.children.push(para1);
    
    const item2 = ast.createListItem('- ');
    const para2 = ast.createParagraph();
    para2.children.push(ast.createText('Item 2'));
    item2.children.push(para2);
    
    // Add items to list
    list.items.push(item1);
    list.items.push(item2);
    
    // Add list to section, section to document
    section.children.push(list);
    document.children.push(section);
    
    const html = renderer.render(document);
    
    // Check that the HTML contains the expected elements
    expect(html).toContain('<ul class="org-unordered-list">');
    expect(html).toContain('<li class="org-list-item">Item 1</li>');
    expect(html).toContain('<li class="org-list-item">Item 2</li>');
  });

  test('should render code blocks', () => {
    const document = ast.createDocument();
    const section = ast.createSection();
    
    // Create a code block
    const codeBlock = ast.createCodeBlock(
      'function hello() {\n  return "world";\n}',
      'javascript'
    );
    
    // Add code block to section, section to document
    section.children.push(codeBlock);
    document.children.push(section);
    
    const html = renderer.render(document);
    
    // Check that the HTML contains the expected elements
    expect(html).toContain('<pre class="org-code-block"><code class="language-javascript">');
    expect(html).toContain('function hello() {\n  return "world";\n}');
  });
}); 