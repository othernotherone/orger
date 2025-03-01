/**
 * Renderer interface for Org Mode documents
 */
import { Document } from '../ast/document';
import { Node } from '../ast/node';

/**
 * Options for renderers
 */
export interface RenderOptions {
  /**
   * Whether to pretty-print the output
   * @default false
   */
  pretty?: boolean;

  /**
   * Custom renderers for specific node types
   */
  renderers?: Record<string, (node: Node, options: RenderOptions) => string>;

  /**
   * Additional options specific to the renderer
   */
  [key: string]: any;
}

/**
 * Interface for renderers
 */
export interface Renderer {
  /**
   * Render a document to a string
   * 
   * @param document The document to render
   * @param options Rendering options
   * @returns The rendered document
   */
  render(document: Document, options?: RenderOptions): string;

  /**
   * Render a node to a string
   * 
   * @param node The node to render
   * @param options Rendering options
   * @returns The rendered node
   */
  renderNode(node: Node, options?: RenderOptions): string;
}

/**
 * Base class for renderers
 */
export abstract class BaseRenderer implements Renderer {
  /**
   * Render a document to a string
   * 
   * @param document The document to render
   * @param options Rendering options
   * @returns The rendered document
   */
  public render(document: Document, options: RenderOptions = {}): string {
    return this.renderNode(document, options);
  }

  /**
   * Render a node to a string
   * 
   * @param node The node to render
   * @param options Rendering options
   * @returns The rendered node
   */
  public renderNode(node: Node, options: RenderOptions = {}): string {
    // Check for custom renderer
    if (options.renderers && options.renderers[node.type]) {
      return options.renderers[node.type](node, options);
    }

    // Use the appropriate renderer based on node type
    const methodName = `render${this.capitalize(node.type)}`;
    if (typeof (this as any)[methodName] === 'function') {
      return (this as any)[methodName](node, options);
    }

    // Default rendering for unknown node types
    return this.renderUnknown(node, options);
  }

  /**
   * Render an unknown node type
   * 
   * @param node The node to render
   * @param options Rendering options
   * @returns The rendered node
   */
  protected renderUnknown(node: Node, options: RenderOptions = {}): string {
    if (node.children) {
      return node.children.map(child => this.renderNode(child, options)).join('');
    }
    
    if ('value' in node) {
      return node.value;
    }
    
    return '';
  }

  /**
   * Capitalize a string
   * 
   * @param str The string to capitalize
   * @returns The capitalized string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Render a document node
   * 
   * @param node The document node
   * @param options Rendering options
   * @returns The rendered document
   */
  protected abstract renderDocument(node: Document, options: RenderOptions): string;
} 