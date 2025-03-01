// Export AST types and factories
export * from './ast';

// Export parser
export * from './parser';

// Export renderers
export * from './renderer';

// Main API
import { Parser } from './parser';
import { HtmlRenderer } from './renderer';
import { Document } from './ast';

/**
 * Parse an Org Mode document
 * @param input The Org Mode document as a string
 * @returns The AST
 */
export function parse(input: string): Document {
  const parser = new Parser();
  return parser.parse(input);
}

/**
 * Render an Org Mode document as HTML
 * @param input The Org Mode document as a string or AST
 * @returns The HTML string
 */
export function renderToHtml(input: string | Document): string {
  const renderer = new HtmlRenderer();
  
  if (typeof input === 'string') {
    const ast = parse(input);
    return renderer.render(ast);
  }
  
  return renderer.render(input);
} 