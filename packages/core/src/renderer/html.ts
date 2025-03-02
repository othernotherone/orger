/**
 * HTML renderer for Org Mode documents
 */
import { Document } from '../ast/document';
import { Node } from '../ast/node';
import { BaseRenderer, RenderOptions } from './renderer';

/**
 * Options for HTML rendering
 */
export interface HtmlRenderOptions extends RenderOptions {
  /**
   * Whether to include a full HTML document with head and body
   * @default false
   */
  fullDocument?: boolean;

  /**
   * CSS classes to add to the root element
   */
  rootClass?: string;

  /**
   * Whether to add CSS classes to elements based on their type
   * @default true
   */
  addTypeClasses?: boolean;

  /**
   * Whether to add data attributes to elements based on their properties
   * @default false
   */
  addDataAttributes?: boolean;

  /**
   * Whether to use semantic HTML5 elements
   * @default true
   */
  useSemanticHtml?: boolean;

  /**
   * Whether the current cell is a header cell (used internally for table rendering)
   */
  isHeaderCell?: boolean;
}

/**
 * Default HTML rendering options
 */
export const DEFAULT_HTML_RENDER_OPTIONS: HtmlRenderOptions = {
  pretty: false,
  fullDocument: false,
  rootClass: 'org-document',
  addTypeClasses: true,
  addDataAttributes: false,
  useSemanticHtml: true
};

/**
 * HTML renderer for Org Mode documents
 */
export class HtmlRenderer extends BaseRenderer {
  /**
   * Render a document to HTML
   * 
   * @param document The document to render
   * @param options Rendering options
   * @returns The rendered HTML
   */
  public render(document: Document, options: HtmlRenderOptions = {}): string {
    // Merge options with defaults
    const mergedOptions: HtmlRenderOptions = {
      ...DEFAULT_HTML_RENDER_OPTIONS,
      ...options
    };

    // Render full document if requested
    if (mergedOptions.fullDocument) {
      return this.renderFullDocument(document, mergedOptions);
    }

    // Otherwise, render just the document content
    return this.renderNode(document, mergedOptions);
  }

  /**
   * Render a full HTML document
   * 
   * @param document The document to render
   * @param options Rendering options
   * @returns The rendered HTML document
   */
  private renderFullDocument(document: Document, options: HtmlRenderOptions): string {
    const title = document.getTitle() || 'Untitled Document';
    const content = this.renderNode(document, options);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    p {
      margin: 1em 0;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    table {
      border-collapse: collapse;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 1em;
      overflow: auto;
    }
    code {
      background-color: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }

  /**
   * Render a document node
   * 
   * @param node The document node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderDocument(node: Document, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ` class="${options.rootClass || 'org-document'}"` : '';
    const children = node.children.map(child => this.renderNode(child, options)).join('');
    
    return `<div${className}>${children}</div>`;
  }

  /**
   * Render a heading node
   * 
   * @param node The heading node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderHeading(node: Node, options: HtmlRenderOptions): string {
    const level = Math.min(node.level || 1, 6);
    const tag = `h${level}`;
    const className = options.addTypeClasses ? ' class="org-heading"' : '';
    
    let attrs = '';
    if (options.addDataAttributes) {
      if (node.todoKeyword) {
        attrs += ` data-todo="${node.todoKeyword}"`;
      }
      if (node.priority) {
        attrs += ` data-priority="${node.priority}"`;
      }
      if (node.tags && node.tags.length > 0) {
        attrs += ` data-tags="${node.tags.join(',')}"`;
      }
    }
    
    const title = this.escapeHtml(node.title || '');
    let content = '';
    
    // Add TODO keyword if present
    if (node.todoKeyword) {
      const todoClass = options.addTypeClasses ? ` class="org-todo org-todo-${node.todoKeyword.toLowerCase()}"` : '';
      content += `<span${todoClass}>${node.todoKeyword}</span> `;
    }
    
    content += title;
    
    const children = node.children && node.children.length > 0 
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `<${tag}${className}${attrs}>${content}</${tag}>${children}`;
  }

  /**
   * Render a paragraph node
   * 
   * @param node The paragraph node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderParagraph(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-paragraph"' : '';
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `<p${className}>${children}</p>`;
  }

  /**
   * Render a text node
   * 
   * @param node The text node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderText(node: Node, _options: HtmlRenderOptions): string {
    return this.escapeHtml(node.value || '');
  }

  /**
   * Render a bold node
   * 
   * @param node The bold node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderBold(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-bold"' : '';
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `<strong${className}>${children}</strong>`;
  }

  /**
   * Render an italic node
   * 
   * @param node The italic node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderItalic(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-italic"' : '';
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `<em${className}>${children}</em>`;
  }

  /**
   * Render an underline node
   * 
   * @param node The underline node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderUnderline(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-underline"' : '';
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `<u${className}>${children}</u>`;
  }

  /**
   * Render a strike-through node
   * 
   * @param node The strike-through node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderStrike_through(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-strike-through"' : '';
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `<del${className}>${children}</del>`;
  }

  /**
   * Render a code node
   * 
   * @param node The code node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderCode(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-code"' : '';
    
    return `<code${className}>${this.escapeHtml(node.value || '')}</code>`;
  }

  /**
   * Render a link node
   * 
   * @param node The link node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderLink(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-link"' : '';
    const url = this.escapeHtml(node.url || '');
    const description = node.description ? this.escapeHtml(node.description) : url;
    
    return `<a href="${url}"${className}>${description}</a>`;
  }

  /**
   * Render a list node
   * 
   * @param node The list node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderList(node: Node, options: HtmlRenderOptions): string {
    const tag = node.listType === 'ordered' ? 'ol' : 'ul';
    const className = options.addTypeClasses ? ` class="org-list org-${node.listType}-list"` : '';
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `<${tag}${className}>${children}</${tag}>`;
  }

  /**
   * Render a list item node
   * 
   * @param node The list item node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderList_item(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-list-item"' : '';
    let content = '';
    
    // Handle checkbox items
    if (node.checked !== undefined && node.checked !== null) {
      const checkboxClass = options.addTypeClasses ? ' class="org-checkbox"' : '';
      const checked = node.checked ? ' checked' : '';
      content += `<input type="checkbox"${checkboxClass}${checked} disabled> `;
    }
    
    // Process children
    if (node.children && node.children.length > 0) {
      // First, render all non-list children
      const textContent = node.children
        .filter(child => child.type !== 'list')
        .map(child => this.renderNode(child, options))
        .join('');
      
      content += textContent;
      
      // Then, render any nested lists
      const nestedLists = node.children
        .filter(child => child.type === 'list')
        .map(child => this.renderNode(child, options))
        .join('');
      
      if (nestedLists) {
        content += nestedLists;
      }
    }
    
    return `<li${className}>${content}</li>`;
  }

  /**
   * Render a table
   * 
   * @param node The table node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderTable(node: Node, options: HtmlRenderOptions): string {
    const className = this.getClassName('table', options);
    const rows = node.children || [];
    
    const renderedRows = rows.map(row => this.renderNode(row, options)).join('');
    
    return `<table${className ? ` class="${className}"` : ''}>\n${renderedRows}</table>\n\n`;
  }

  /**
   * Get a class name based on the type and options
   * 
   * @param type The node type
   * @param options Rendering options
   * @returns The class name or empty string
   */
  private getClassName(type: string, options: HtmlRenderOptions): string {
    return options.addTypeClasses ? `org-${type}` : '';
  }

  /**
   * Render a table row
   * 
   * @param node The table row node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderTable_row(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? `org-table-row` : '';
    const cells = node.children || [];
    
    const isHeader = node.isHeader;
    const renderedCells = cells.map(cell => {
      // Instead of modifying the node, we'll pass the isHeader flag to the cell renderer
      return this.renderTable_cell(cell, { ...options, isHeaderCell: isHeader });
    }).join('');
    
    return `<tr${className ? ` class="${className}"` : ''}>\n${renderedCells}</tr>\n`;
  }

  /**
   * Render a table cell
   * 
   * @param node The table cell node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderTable_cell(node: Node, options: HtmlRenderOptions): string {
    // Use the isHeaderCell option to determine the tag
    const tag = options.isHeaderCell ? 'th' : 'td';
    const className = options.addTypeClasses ? `org-table-cell` : '';
    
    const content = (node.children || []).map(child => this.renderNode(child, options)).join('');
    
    return `<${tag}${className ? ` class="${className}"` : ''}>${content}</${tag}>\n`;
  }

  /**
   * Render a code block node
   * 
   * @param node The code block node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderCode_block(node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-code-block"' : '';
    const language = node.language ? ` data-language="${node.language}"` : '';
    
    return `<pre${className}${language}><code>${this.escapeHtml(node.value || '')}</code></pre>`;
  }

  /**
   * Render a comment node
   * 
   * @param node The comment node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderComment(node: Node, options: HtmlRenderOptions): string {
    if (!options.preserveComments) {
      return '';
    }
    
    const className = options.addTypeClasses ? ' class="org-comment"' : '';
    
    return `<div${className}><!-- ${this.escapeHtml(node.value || '')} --></div>`;
  }

  /**
   * Render a horizontal rule node
   * 
   * @param node The horizontal rule node
   * @param options Rendering options
   * @returns The rendered HTML
   */
  protected renderHorizontal_rule(_node: Node, options: HtmlRenderOptions): string {
    const className = options.addTypeClasses ? ' class="org-horizontal-rule"' : '';
    
    return `<hr${className}>`;
  }

  /**
   * Escape HTML special characters
   * 
   * @param text The text to escape
   * @returns The escaped text
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
   * Render a node
   * 
   * @param node The node to render
   * @param options Rendering options
   * @returns The rendered HTML
   */
  public renderNode(node: Node, options: HtmlRenderOptions = {}): string {
    // Check for custom renderer
    if (options.renderers && options.renderers[node.type]) {
      return options.renderers[node.type](node, options);
    }

    // Use the appropriate renderer based on node type
    switch (node.type) {
      case 'document':
        return this.renderDocument(node as Document, options);
      case 'heading':
        return this.renderHeading(node, options);
      case 'paragraph':
        return this.renderParagraph(node, options);
      case 'text':
        return this.renderText(node, options);
      case 'bold':
        return this.renderBold(node, options);
      case 'italic':
        return this.renderItalic(node, options);
      case 'underline':
        return this.renderUnderline(node, options);
      case 'strike_through':
        return this.renderStrike_through(node, options);
      case 'code':
        return this.renderCode(node, options);
      case 'list':
        return this.renderList(node, options);
      case 'list_item':
        return this.renderList_item(node, options);
      case 'table':
        return this.renderTable(node, options);
      case 'table_row':
        return this.renderTable_row(node, options);
      case 'table_cell':
        return this.renderTable_cell(node, options);
      default:
        return '';
    }
  }
}

/**
 * Create a new HTML renderer
 * 
 * @returns A new HTML renderer
 */
export function createHtmlRenderer(): HtmlRenderer {
  return new HtmlRenderer();
} 