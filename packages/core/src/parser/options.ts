/**
 * Parser options
 */
import { Plugin } from '../utils/plugin';

/**
 * Options for the parser
 */
export interface ParseOptions {
  /**
   * Whether to throw errors on invalid syntax
   * @default false
   */
  strict?: boolean;

  /**
   * Custom TODO keywords
   * @default ['TODO', 'DONE']
   */
  todoKeywords?: string[];

  /**
   * Custom plugins to extend the parser
   * @default []
   */
  plugins?: Plugin[];

  /**
   * Whether to include position information in the AST
   * @default true
   */
  locations?: boolean;

  /**
   * Whether to include comments in the AST
   * @default true
   */
  preserveComments?: boolean;

  /**
   * Whether to parse inline formatting (bold, italic, etc.)
   * @default true
   */
  parseInlineFormatting?: boolean;

  /**
   * Whether to parse links
   * @default true
   */
  parseLinks?: boolean;

  /**
   * Whether to parse timestamps
   * @default true
   */
  parseTimestamps?: boolean;

  /**
   * Whether to parse footnotes
   * @default true
   */
  parseFootnotes?: boolean;

  /**
   * Whether to parse drawers
   * @default true
   */
  parseDrawers?: boolean;

  /**
   * Whether to parse tables
   * @default true
   */
  parseTables?: boolean;

  /**
   * Whether to parse code blocks
   * @default true
   */
  parseCodeBlocks?: boolean;

  /**
   * Whether to parse lists
   * @default true
   */
  parseLists?: boolean;
}

/**
 * Default parser options
 */
export const DEFAULT_PARSE_OPTIONS: ParseOptions = {
  strict: false,
  todoKeywords: ['TODO', 'DONE'],
  plugins: [],
  locations: true,
  preserveComments: true,
  parseInlineFormatting: true,
  parseLinks: true,
  parseTimestamps: true,
  parseFootnotes: true,
  parseDrawers: true,
  parseTables: true,
  parseCodeBlocks: true,
  parseLists: true
}; 