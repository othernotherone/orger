import * as ast from '../ast';

/**
 * HTML renderer options
 */
export interface HtmlRendererOptions {
  /**
   * Whether to include document title as h1
   */
  includeTitle?: boolean;
  
  /**
   * CSS class prefix for HTML elements
   */
  classPrefix?: string;
  
  /**
   * Whether to use CSS classes for styling
   */
  useClasses?: boolean;
}

/**
 * Renders an Org Mode AST as HTML
 */
export class HtmlRenderer {
  private options: HtmlRendererOptions;
  
  /**
   * Create a new HTML renderer
   */
  constructor(options: HtmlRendererOptions = {}) {
    this.options = {
      includeTitle: true,
      classPrefix: 'org-',
      useClasses: true,
      ...options,
    };
  }
  
  /**
   * Render an Org Mode document as HTML
   */
  render(document: ast.Document): string {
    const title = document.properties.TITLE;
    const author = document.properties.AUTHOR;
    
    let html = '<div';
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}document"`;
    }
    
    html += '>\n';
    
    // Add title if present and option is enabled
    if (title && this.options.includeTitle) {
      html += `<h1 class="${this.options.classPrefix}title">${this.escapeHtml(title)}</h1>\n`;
      
      if (author) {
        html += `<p class="${this.options.classPrefix}author">${this.escapeHtml(author)}</p>\n`;
      }
    }
    
    // Render sections
    for (const section of document.children) {
      html += this.renderSection(section);
    }
    
    html += '</div>\n';
    
    return html;
  }
  
  /**
   * Render a section
   */
  private renderSection(section: ast.Section): string {
    let html = '<section';
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}section"`;
    }
    
    html += '>\n';
    
    // Render heading if present
    if (section.heading) {
      html += this.renderHeading(section.heading);
    }
    
    // Render section content
    for (const child of section.children) {
      switch (child.type) {
        case 'paragraph':
          html += this.renderParagraph(child);
          break;
        case 'list':
          html += this.renderList(child);
          break;
        case 'table':
          html += this.renderTable(child);
          break;
        case 'code_block':
          html += this.renderCodeBlock(child);
          break;
        case 'section':
          html += this.renderSection(child);
          break;
      }
    }
    
    html += '</section>\n';
    
    return html;
  }
  
  /**
   * Render a heading
   */
  private renderHeading(heading: ast.Heading): string {
    const level = Math.min(heading.level + 1, 6); // h1-h6
    let html = `<h${level}`;
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}heading"`;
    }
    
    // Add id for linking
    const id = this.slugify(heading.title);
    html += ` id="${id}"`;
    
    html += '>';
    
    // Add TODO keyword if present
    if (heading.todoKeyword) {
      const todoClass = heading.todoKeyword === 'DONE' 
        ? `${this.options.classPrefix}todo-done` 
        : `${this.options.classPrefix}todo-active`;
      
      html += `<span class="${todoClass}">${heading.todoKeyword}</span> `;
    }
    
    // Add priority if present
    if (heading.priority) {
      html += `<span class="${this.options.classPrefix}priority">[#${heading.priority}]</span> `;
    }
    
    // Add title
    html += this.escapeHtml(heading.title);
    
    // Add tags if present
    if (heading.tags.length > 0) {
      html += ' <span class="tags">';
      
      for (const tag of heading.tags) {
        html += `<span class="${this.options.classPrefix}tag">${tag}</span>`;
      }
      
      html += '</span>';
    }
    
    html += `</h${level}>\n`;
    
    return html;
  }
  
  /**
   * Render a paragraph
   */
  private renderParagraph(paragraph: ast.Paragraph): string {
    let html = '<p';
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}paragraph"`;
    }
    
    html += '>';
    
    // Render paragraph content
    for (const child of paragraph.children) {
      switch (child.type) {
        case 'text':
          html += this.escapeHtml(child.value);
          break;
        case 'formatted':
          html += this.renderFormattedText(child);
          break;
        case 'link':
          html += this.renderLink(child);
          break;
      }
    }
    
    html += '</p>\n';
    
    return html;
  }
  
  /**
   * Render formatted text
   */
  private renderFormattedText(text: ast.FormattedText): string {
    let tag: string;
    let cssClass: string;
    
    switch (text.format) {
      case 'bold':
        tag = 'strong';
        cssClass = 'bold';
        break;
      case 'italic':
        tag = 'em';
        cssClass = 'italic';
        break;
      case 'underline':
        tag = 'span';
        cssClass = 'underline';
        break;
      case 'strikethrough':
        tag = 'del';
        cssClass = 'strikethrough';
        break;
      case 'code':
        tag = 'code';
        cssClass = 'code';
        break;
      case 'verbatim':
        tag = 'kbd';
        cssClass = 'verbatim';
        break;
      default:
        tag = 'span';
        cssClass = text.format;
    }
    
    let html = `<${tag}`;
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}${cssClass}"`;
    }
    
    html += '>';
    
    // Render content
    for (const child of text.children) {
      switch (child.type) {
        case 'text':
          html += this.escapeHtml(child.value);
          break;
        case 'formatted':
          html += this.renderFormattedText(child);
          break;
        case 'link':
          html += this.renderLink(child);
          break;
      }
    }
    
    html += `</${tag}>`;
    
    return html;
  }
  
  /**
   * Render a link
   */
  private renderLink(link: ast.Link): string {
    let href: string;
    
    switch (link.protocol) {
      case 'http':
      case 'https':
      case 'mailto':
        href = `${link.protocol}:${link.path}`;
        break;
      case 'file':
        href = link.path;
        break;
      default:
        href = `${link.protocol}:${link.path}`;
    }
    
    let html = `<a href="${this.escapeHtml(href)}"`;
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}link"`;
    }
    
    html += '>';
    
    // Use description if available, otherwise use path
    html += this.escapeHtml(link.description || link.path);
    
    html += '</a>';
    
    return html;
  }
  
  /**
   * Render a list
   */
  private renderList(list: ast.List): string {
    const tag = list.ordered ? 'ol' : 'ul';
    let html = `<${tag}`;
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}${list.ordered ? 'ordered-list' : 'unordered-list'}"`;
    }
    
    html += '>\n';
    
    // Render list items
    for (const item of list.items) {
      html += this.renderListItem(item);
    }
    
    html += `</${tag}>\n`;
    
    return html;
  }
  
  /**
   * Render a list item
   */
  private renderListItem(item: ast.ListItem): string {
    let html = '<li';
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}list-item"`;
    }
    
    html += '>';
    
    // Add checkbox if present
    if (item.checkbox) {
      let checkboxHtml = '<input type="checkbox"';
      
      if (item.checkbox === 'checked') {
        checkboxHtml += ' checked';
      }
      
      if (item.checkbox === 'partial') {
        checkboxHtml += ' indeterminate';
      }
      
      checkboxHtml += ' disabled>';
      
      html += checkboxHtml;
    }
    
    // Render item content
    for (const child of item.children) {
      switch (child.type) {
        case 'paragraph':
          // For list items, we don't wrap the first paragraph in <p> tags
          if (item.children.indexOf(child) === 0) {
            for (const textChild of child.children) {
              if (textChild.type === 'text') {
                html += this.escapeHtml(textChild.value);
              }
            }
          } else {
            html += this.renderParagraph(child);
          }
          break;
        case 'list':
          html += this.renderList(child);
          break;
      }
    }
    
    html += '</li>\n';
    
    return html;
  }
  
  /**
   * Render a table
   */
  private renderTable(table: ast.Table): string {
    let html = '<table';
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}table"`;
    }
    
    html += '>\n';
    
    // Render table rows
    for (const row of table.rows) {
      html += this.renderTableRow(row);
    }
    
    html += '</table>\n';
    
    return html;
  }
  
  /**
   * Render a table row
   */
  private renderTableRow(row: ast.TableRow): string {
    let html = '<tr';
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}table-row"`;
    }
    
    html += '>\n';
    
    // Render table cells
    for (const cell of row.cells) {
      html += this.renderTableCell(cell, row.isHeader);
    }
    
    html += '</tr>\n';
    
    return html;
  }
  
  /**
   * Render a table cell
   */
  private renderTableCell(cell: ast.TableCell, isHeader: boolean): string {
    const tag = isHeader ? 'th' : 'td';
    let html = `<${tag}`;
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}table-cell"`;
    }
    
    html += '>';
    
    // Render cell content
    for (const child of cell.children) {
      switch (child.type) {
        case 'text':
          html += this.escapeHtml(child.value);
          break;
        case 'formatted':
          html += this.renderFormattedText(child);
          break;
        case 'link':
          html += this.renderLink(child);
          break;
      }
    }
    
    html += `</${tag}>\n`;
    
    return html;
  }
  
  /**
   * Render a code block
   */
  private renderCodeBlock(block: ast.CodeBlock): string {
    let html = '<pre';
    
    if (this.options.useClasses) {
      html += ` class="${this.options.classPrefix}code-block"`;
    }
    
    html += '><code';
    
    if (block.language) {
      html += ` class="language-${block.language}"`;
    }
    
    html += '>';
    
    html += this.escapeHtml(block.value);
    
    html += '</code></pre>\n';
    
    return html;
  }
  
  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * Convert a string to a slug for use as an ID
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
} 