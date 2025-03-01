import * as fs from 'fs';
import * as path from 'path';
import * as pegjs from 'pegjs';
import * as ast from '../ast';

/**
 * Parser options
 */
export interface ParserOptions {
  /**
   * Whether to include position information in the AST
   */
  includePositions?: boolean;
}

/**
 * Org Mode parser
 */
export class Parser {
  private parser: pegjs.Parser;

  /**
   * Create a new parser instance
   */
  constructor(options: ParserOptions = {}) {
    const grammarPath = path.join(__dirname, 'grammar.pegjs');
    const grammar = fs.readFileSync(grammarPath, 'utf-8');
    
    this.parser = pegjs.generate(grammar, {
      output: 'parser',
      trace: false,
      cache: true,
      optimize: 'speed',
      format: 'commonjs',
      allowedStartRules: ['Document'],
      ...options,
    });
  }

  /**
   * Parse an Org Mode document
   * @param input The Org Mode document as a string
   * @returns The AST
   */
  parse(input: string): ast.Document {
    try {
      return this.parser.parse(input) as ast.Document;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error parsing Org document: ${error.message}`);
      }
      throw error;
    }
  }
} 