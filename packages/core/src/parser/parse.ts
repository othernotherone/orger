/**
 * Simple parse function for Org Mode documents
 */
import { Parser } from './parser';
import { Document } from '../ast/document';
import { ParseOptions } from './options';

/**
 * Parse Org Mode text into an AST
 * 
 * @param text The Org Mode text to parse
 * @param options Parser options
 * @returns A Document node representing the parsed Org Mode document
 */
export function parse(text: string, options: Partial<ParseOptions> = {}): Document {
  const parser = new Parser(options);
  return parser.parse(text);
} 