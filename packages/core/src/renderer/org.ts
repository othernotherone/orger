/**
 * Renderer for Org Mode format
 */
import { Document } from '../ast/document';
import { Node } from '../ast/node';
import { RenderOptions } from './options';

/**
 * Renderer for Org Mode format
 */
export class OrgRenderer {
  /**
   * Render a document to Org Mode format
   * 
   * @param document The document to render
   * @param options Render options
   * @returns The rendered document
   */
  public render(document: Document, options: RenderOptions = {}): string {
    return this.renderNode(document, options);
  }

  /**
   * Render a node to Org Mode format
   * 
   * @param node The node to render
   * @param options Render options
   * @returns The rendered node
   */
  private renderNode(node: Node, options: RenderOptions = {}): string {
    switch (node.type) {
      case 'document':
        return this.renderDocument(node as Document, options);
      case 'heading':
        return this.renderHeading(node, options);
      case 'paragraph':
        return this.renderParagraph(node, options);
      case 'text':
        return this.renderText(node);
      case 'list':
        return this.renderList(node, options);
      case 'list_item':
        return this.renderListItem(node, options, 0);
      case 'bold':
        return this.renderBold(node, options);
      case 'italic':
        return this.renderItalic(node, options);
      case 'underline':
        return this.renderUnderline(node, options);
      case 'strikethrough':
        return this.renderStrikethrough(node, options);
      case 'code':
        return this.renderCode(node);
      case 'verbatim':
        return this.renderVerbatim(node);
      case 'table':
        return this.renderTable(node);
      case 'table_row':
        return this.renderTableRow(node);
      case 'table_cell':
        return this.renderTableCell(node);
      default:
        return '';
    }
  }

  /**
   * Render a document to Org Mode format
   * 
   * @param document The document to render
   * @param options Render options
   * @returns The rendered document
   */
  private renderDocument(document: Document, options: RenderOptions = {}): string {
    const children = document.children.map(child => this.renderNode(child, options)).join('');
    return children;
  }

  /**
   * Render a heading to Org Mode format
   * 
   * @param node The heading node
   * @param options Render options
   * @returns The rendered heading
   */
  private renderHeading(node: Node, options: RenderOptions = {}): string {
    const level = node.level || 1;
    const stars = '*'.repeat(level);
    const todoKeyword = node.todoKeyword ? `${node.todoKeyword} ` : '';
    const title = node.title || '';
    
    let result = `${stars} ${todoKeyword}${title}\n`;
    
    if (node.children && node.children.length > 0) {
      result += node.children.map(child => this.renderNode(child, options)).join('');
    }
    
    return result;
  }

  /**
   * Render a paragraph to Org Mode format
   * 
   * @param node The paragraph node
   * @param options Render options
   * @returns The rendered paragraph
   */
  private renderParagraph(node: Node, options: RenderOptions = {}): string {
    if (!node.children || node.children.length === 0) {
      return '\n';
    }
    
    const content = node.children.map(child => this.renderNode(child, options)).join('');
    return `${content}\n\n`;
  }

  /**
   * Render text to Org Mode format
   * 
   * @param node The text node
   * @returns The rendered text
   */
  private renderText(node: Node): string {
    return node.value || '';
  }

  /**
   * Render a list to Org Mode format
   * 
   * @param node The list node
   * @param options Render options
   * @returns The rendered list
   */
  private renderList(node: Node, options: RenderOptions = {}): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    const items = node.children.map(child => this.renderNode(child, options)).join('');
    return items;
  }

  /**
   * Render a list item to Org Mode format
   * 
   * @param node The list item node
   * @param options Render options
   * @param level The indentation level
   * @returns The rendered list item
   */
  private renderListItem(node: Node, options: RenderOptions = {}, level = 0): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    // Determine the marker based on whether this is an ordered list item
    const marker = node.ordered ? '1.' : '-';
    
    // Calculate indentation
    const indent = ' '.repeat(level * 2);
    
    // Process text content and nested lists separately
    const textNodes: Node[] = [];
    const listNodes: Node[] = [];
    
    node.children.forEach(child => {
      if (child.type === 'text') {
        textNodes.push(child);
      } else if (child.type === 'list') {
        listNodes.push(child);
      }
    });
    
    // Render text content
    const content = textNodes.map(child => this.renderNode(child, options)).join('');
    
    // Start with the list item marker and content
    let result = `${indent}${marker} ${content}\n`;
    
    // Render nested lists with increased indentation
    if (listNodes.length > 0) {
      listNodes.forEach(listNode => {
        if (listNode.children && listNode.children.length > 0) {
          listNode.children.forEach(item => {
            result += this.renderListItem(item, options, level + 1);
          });
        }
      });
    }
    
    return result;
  }

  /**
   * Render a bold node to Org Mode format
   * 
   * @param node The bold node
   * @param options Render options
   * @returns The rendered bold text
   */
  private renderBold(node: Node, options: RenderOptions = {}): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    const content = node.children.map(child => this.renderNode(child, options)).join('');
    return `*${content}*`;
  }

  /**
   * Render an italic node to Org Mode format
   * 
   * @param node The italic node
   * @param options Render options
   * @returns The rendered italic text
   */
  private renderItalic(node: Node, options: RenderOptions = {}): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    const content = node.children.map(child => this.renderNode(child, options)).join('');
    return `/${content}/`;
  }

  /**
   * Render an underline node to Org Mode format
   * 
   * @param node The underline node
   * @param options Render options
   * @returns The rendered underlined text
   */
  private renderUnderline(node: Node, options: RenderOptions = {}): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    const content = node.children.map(child => this.renderNode(child, options)).join('');
    return `_${content}_`;
  }

  /**
   * Render a strikethrough node to Org Mode format
   * 
   * @param node The strikethrough node
   * @param options Render options
   * @returns The rendered strikethrough text
   */
  private renderStrikethrough(node: Node, options: RenderOptions = {}): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    const content = node.children.map(child => this.renderNode(child, options)).join('');
    return `+${content}+`;
  }

  /**
   * Render a code node to Org Mode format
   * 
   * @param node The code node
   * @returns The rendered code
   */
  private renderCode(node: Node): string {
    return `~${node.value || ''}~`;
  }

  /**
   * Render a verbatim node to Org Mode format
   * 
   * @param node The verbatim node
   * @returns The rendered verbatim text
   */
  private renderVerbatim(node: Node): string {
    return `=${node.value || ''}=`;
  }

  /**
   * Render a table to Org Mode format
   * 
   * @param node The table node
   * @returns The rendered table
   */
  private renderTable(node: Node): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    // Render each row
    const rows = node.children.map((row, index) => {
      const renderedRow = this.renderTableRow(row);
      
      // Add a separator after the header row
      if (index === 0 && row.isHeader) {
        // Calculate the number of cells
        const cellCount = row.children ? row.children.length : 0;
        // Create a separator row with the right number of cells
        const separator = '|' + '-'.repeat(cellCount * 3) + '|';
        return renderedRow + separator + '\n';
      }
      
      return renderedRow;
    }).join('');
    
    return rows + '\n';
  }

  /**
   * Render a table row to Org Mode format
   * 
   * @param node The table row node
   * @returns The rendered table row
   */
  private renderTableRow(node: Node): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }
    
    // Render each cell
    const cells = node.children.map(cell => this.renderTableCell(cell)).join('');
    
    return '|' + cells + '\n';
  }

  /**
   * Render a table cell to Org Mode format
   * 
   * @param node The table cell node
   * @returns The rendered table cell
   */
  private renderTableCell(node: Node): string {
    if (!node.children || node.children.length === 0) {
      return ' | ';
    }
    
    const content = node.children.map(child => this.renderNode(child)).join('');
    
    return ` ${content} |`;
  }
} 