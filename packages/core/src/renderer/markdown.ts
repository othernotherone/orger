/**
 * Markdown renderer for Org Mode documents
 */
import { Document } from '../ast/document';
import { Node } from '../ast/node';
import { BaseRenderer, RenderOptions } from './renderer';

/**
 * Options for Markdown rendering
 */
export interface MarkdownRenderOptions extends RenderOptions {
  /**
   * Whether to use GitHub Flavored Markdown
   * @default true
   */
  gfm?: boolean;

  /**
   * Whether to include frontmatter with document properties
   * @default false
   */
  frontmatter?: boolean;

  /**
   * Whether to allow HTML in the output
   * @default false
   */
  allowHtml?: boolean;

  /**
   * Whether to preserve line breaks in paragraphs
   * @default false
   */
  preserveLineBreaks?: boolean;

  /**
   * Size of indentation in spaces
   * @default 2
   */
  indentSize?: number;
}

/**
 * Default Markdown rendering options
 */
export const DEFAULT_MARKDOWN_RENDER_OPTIONS: MarkdownRenderOptions = {
  pretty: true,
  gfm: true,
  frontmatter: false,
  allowHtml: false,
  preserveLineBreaks: false,
  indentSize: 2
};

/**
 * Markdown renderer for Org Mode documents
 */
export class MarkdownRenderer extends BaseRenderer {
  /**
   * Render a document to Markdown
   * 
   * @param document The document to render
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  public render(document: Document, options: MarkdownRenderOptions = {}): string {
    // Merge options with defaults
    const mergedOptions: MarkdownRenderOptions = {
      ...DEFAULT_MARKDOWN_RENDER_OPTIONS,
      ...options
    };

    let output = '';

    // Add frontmatter if requested
    if (mergedOptions.frontmatter) {
      output += this.renderFrontmatter(document) + '\n\n';
    }

    // Render document content
    output += this.renderNode(document, mergedOptions);

    return output;
  }

  /**
   * Render frontmatter with document properties
   * 
   * @param document The document to render frontmatter for
   * @returns The rendered frontmatter
   */
  private renderFrontmatter(document: Document): string {
    const properties: Record<string, string> = {};

    // Add title if available
    const title = document.getTitle();
    if (title) {
      properties.title = title;
    }

    // Add author if available
    const author = document.getProperty('AUTHOR');
    if (author) {
      properties.author = author;
    }

    // Add date if available
    const date = document.getProperty('DATE');
    if (date) {
      properties.date = date;
    }

    // Add other properties
    for (const [key, value] of Object.entries(document.getProperties())) {
      if (!['TITLE', 'AUTHOR', 'DATE'].includes(key)) {
        properties[key.toLowerCase()] = String(value);
      }
    }

    // Generate YAML frontmatter
    let frontmatter = '---\n';
    for (const [key, value] of Object.entries(properties)) {
      frontmatter += `${key}: ${value}\n`;
    }
    frontmatter += '---';

    return frontmatter;
  }

  /**
   * Render a document node
   * 
   * @param node The document node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderDocument(node: Document, options: MarkdownRenderOptions): string {
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('\n\n')
      : '';
    
    return children;
  }

  /**
   * Render a heading node
   * 
   * @param node The heading node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderHeading(node: Node, _options: MarkdownRenderOptions): string {
    const level = Math.min(node.level || 1, 6);
    const prefix = '#'.repeat(level);
    
    let heading = `${prefix} `;
    
    // Add TODO keyword if present
    if (node.todoKeyword) {
      heading += `**${node.todoKeyword}** `;
    }
    
    // Add title
    heading += node.title || '';
    
    // Add tags if present
    if (node.tags && node.tags.length > 0) {
      heading += ` :${node.tags.join(':')}:`;
    }
    
    // Add children if present
    let result = heading;
    if (node.children && node.children.length > 0) {
      result += '\n\n' + node.children.map(child => this.renderNode(child, _options)).join('\n\n');
    }
    
    return result;
  }

  /**
   * Render a paragraph node
   * 
   * @param node The paragraph node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderParagraph(node: Node, options: MarkdownRenderOptions): string {
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return children;
  }

  /**
   * Render a text node
   * 
   * @param node The text node
   * @param _options Rendering options
   * @returns The rendered Markdown
   */
  protected renderText(node: Node, _options: MarkdownRenderOptions): string {
    return node.value || '';
  }

  /**
   * Render a bold node
   * 
   * @param node The bold node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderBold(node: Node, options: MarkdownRenderOptions): string {
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `**${children}**`;
  }

  /**
   * Render an italic node
   * 
   * @param node The italic node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderItalic(node: Node, options: MarkdownRenderOptions): string {
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `*${children}*`;
  }

  /**
   * Render an underline node
   * 
   * @param node The underline node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderUnderline(node: Node, options: MarkdownRenderOptions): string {
    // Markdown doesn't have native underline, use emphasis or HTML
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    if (options.allowHtml) {
      return `<u>${children}</u>`;
    } else {
      return `_${children}_`;
    }
  }

  /**
   * Render a strike-through node
   * 
   * @param node The strike-through node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderStrike_through(node: Node, options: MarkdownRenderOptions): string {
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return `~~${children}~~`;
  }

  /**
   * Render a code node
   * 
   * @param node The code node
   * @param _options Rendering options
   * @returns The rendered Markdown
   */
  protected renderCode(node: Node, _options: MarkdownRenderOptions): string {
    return `\`${node.value || ''}\``;
  }

  /**
   * Render a link node
   * 
   * @param node The link node
   * @param _options Rendering options
   * @returns The rendered Markdown
   */
  protected renderLink(node: Node, _options: MarkdownRenderOptions): string {
    const url = node.url || '';
    const description = node.description || url;
    
    return `[${description}](${url})`;
  }

  /**
   * Render a list node
   * 
   * @param node The list node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderList(node: Node, options: MarkdownRenderOptions): string {
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('\n')
      : '';
    
    return children;
  }

  /**
   * Render a list item node
   * 
   * @param node The list item node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderList_item(node: Node, options: MarkdownRenderOptions): string {
    const indent = ' '.repeat(options.indentSize || 2);
    const listType = node.parent?.listType || 'unordered';
    const marker = listType === 'ordered' ? '1.' : '-';
    
    let content = '';
    
    // Handle checkbox items
    if (node.checked !== undefined && node.checked !== null) {
      content += node.checked ? '[x] ' : '[ ] ';
    }
    
    // Process children
    if (node.children && node.children.length > 0) {
      // First, handle non-list children
      const textNodes = node.children.filter(child => child.type !== 'list');
      if (textNodes.length > 0) {
        const textContent = textNodes.map(child => this.renderNode(child, options)).join('');
        content += textContent;
      }
      
      // Then, handle nested lists with proper indentation
      const listNodes = node.children.filter(child => child.type === 'list');
      if (listNodes.length > 0) {
        const nestedListContent = listNodes.map(list => {
          // Create a new options object with increased indentation for nested lists
          const nestedOptions = { ...options, indentSize: (options.indentSize || 2) + 2 };
          
          // Render each list item with proper indentation
          return '\n' + (list.children || []).map(item => {
            const renderedItem = this.renderList_item(item, nestedOptions);
            return indent + renderedItem;
          }).join('\n');
        }).join('');
        
        content += nestedListContent;
      }
    }
    
    return `${marker} ${content}`;
  }

  /**
   * Render a table node
   * 
   * @param node The table node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderTable(node: Node, options: MarkdownRenderOptions): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    const rows = node.children;
    
    // Calculate column widths
    const columnWidths: number[] = [];
    for (const row of rows) {
      if (row.children) {
        row.children.forEach((cell, i) => {
          const cellContent = this.renderNode(cell, options);
          columnWidths[i] = Math.max(columnWidths[i] || 0, cellContent.length);
        });
      }
    }
    
    // Render rows
    const renderedRows = rows.map((row, rowIndex) => {
      if (!row.children) return '';
      
      const cells = row.children.map((cell, i) => {
        const content = this.renderNode(cell, options);
        // Pad content to match column width
        return content.padEnd(columnWidths[i] || content.length, ' ');
      }).join(' | ');
      
      // Add separator row after header
      if (rowIndex === 0) {
        const separator = columnWidths.map(width => '-'.repeat(width)).join(' | ');
        return `| ${cells} |\n| ${separator} |`;
      }
      
      return `| ${cells} |`;
    }).join('\n');
    
    return renderedRows;
  }

  /**
   * Render a table cell node
   * 
   * @param node The table cell node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderTable_cell(node: Node, options: MarkdownRenderOptions): string {
    const children = node.children && node.children.length > 0
      ? node.children.map(child => this.renderNode(child, options)).join('')
      : '';
    
    return children;
  }

  /**
   * Render a code block node
   * 
   * @param node The code block node
   * @param _options Rendering options
   * @returns The rendered Markdown
   */
  protected renderCode_block(node: Node, _options: MarkdownRenderOptions): string {
    const language = node.language || '';
    const value = node.value || '';
    
    return `\`\`\`${language}\n${value}\n\`\`\``;
  }

  /**
   * Render a comment node
   * 
   * @param node The comment node
   * @param options Rendering options
   * @returns The rendered Markdown
   */
  protected renderComment(node: Node, options: MarkdownRenderOptions): string {
    if (!options.preserveComments) {
      return '';
    }
    
    if (options.allowHtml) {
      return `<!-- ${node.value || ''} -->`;
    }
    
    // If HTML is not allowed, use a Markdown comment-like syntax
    return `[//]: # (${node.value || ''})`;
  }

  /**
   * Render a horizontal rule node
   * 
   * @param _node The horizontal rule node
   * @param _options Rendering options
   * @returns The rendered Markdown
   */
  protected renderHorizontal_rule(_node: Node, _options: MarkdownRenderOptions): string {
    return '---';
  }
}

/**
 * Create a new Markdown renderer
 * 
 * @returns A new Markdown renderer
 */
export function createMarkdownRenderer(): MarkdownRenderer {
  return new MarkdownRenderer();
} 