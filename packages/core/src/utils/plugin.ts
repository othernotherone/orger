/**
 * Plugin system for extending the parser
 */
import { Node } from '../ast/node';

/**
 * Interface for parser plugins
 */
export interface Plugin {
  /**
   * The name of the plugin
   */
  name: string;

  /**
   * Initialize the plugin
   * 
   * @param options Options passed to the plugin
   */
  initialize?: (options?: Record<string, any>) => void;

  /**
   * Custom tokenizers for the parser
   */
  tokenizers?: {
    /**
     * The pattern to match
     */
    pattern: RegExp;

    /**
     * Process the matched text
     * 
     * @param text The matched text
     * @param context The parsing context
     * @returns The processed node, or undefined to skip
     */
    process: (text: string, context: any) => Node | undefined;
  }[];

  /**
   * Custom node processors
   */
  processors?: {
    /**
     * The type of node to process
     */
    nodeType: string;

    /**
     * Process the node
     * 
     * @param node The node to process
     * @param context The parsing context
     * @returns The processed node, or undefined to remove
     */
    process: (node: Node, context: any) => Node | undefined;
  }[];

  /**
   * Custom renderers
   */
  renderers?: {
    /**
     * The format to render to
     */
    format: string;

    /**
     * The type of node to render
     */
    nodeType: string;

    /**
     * Render the node
     * 
     * @param node The node to render
     * @param options Rendering options
     * @returns The rendered node
     */
    render: (node: Node, options: Record<string, any>) => string;
  }[];
} 