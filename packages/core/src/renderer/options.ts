/**
 * Options for rendering
 */
export interface RenderOptions {
  /**
   * Whether to pretty-print the output
   */
  pretty?: boolean;
  
  /**
   * Custom renderers for specific node types
   */
  renderers?: Record<string, (node: any, options: RenderOptions) => string>;
} 