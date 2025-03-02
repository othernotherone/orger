/**
 * Parser for Org Mode documents
 */
import * as pegjs from 'pegjs';
import { Document } from '../ast/document';
import { Node } from '../ast/node';
import { ParseOptions } from './options';
import { Plugin } from '../utils/plugin';

/**
 * Parser for Org Mode documents
 */
export class Parser {
  private grammar: string;
  private parser: pegjs.Parser;
  private options: ParseOptions;
  private plugins: Plugin[];

  /**
   * Create a new parser
   * 
   * @param options Parser options
   */
  constructor(options: ParseOptions = {}) {
    this.options = options;
    this.plugins = options.plugins || [];
    
    // Initialize plugins
    this.plugins.forEach(plugin => {
      if (plugin.initialize) {
        plugin.initialize(this);
      }
    });
    
    // Load grammar
    // In a real implementation, this would be loaded from a file
    // For now, we'll define a simple grammar inline
    this.grammar = `
      {
        function createDocument(children) {
          return {
            type: 'document',
            children: children || []
          };
        }
        
        function createHeading(level, title, children, todoKeyword) {
          return {
            type: 'heading',
            level: level,
            title: title,
            todoKeyword: todoKeyword,
            children: children || []
          };
        }
        
        function createParagraph(children) {
          return {
            type: 'paragraph',
            children: children || []
          };
        }
        
        function createText(value) {
          return {
            type: 'text',
            value: value
          };
        }
      }
      
      document
        = newline* children:(heading / paragraph)* {
            return createDocument(children);
          }
      
      heading
        = stars:asterisk+ whitespace todo_keyword:todo_keyword? title:(!newline .)* newline children:(heading / paragraph)* {
          const level = stars.length;
          const titleText = title.map(t => t[1]).join('').trim();
          return createHeading(level, titleText, children.filter(Boolean), todo_keyword);
        }
      
      todo_keyword
        = keyword:(todo / done / feedback / verify / delegated / project / idea) whitespace {
            return keyword;
          }
      
      todo = "TODO" { return "TODO"; }
      done = "DONE" { return "DONE"; }
      feedback = "FEEDBACK" { return "FEEDBACK"; }
      verify = "VERIFY" { return "VERIFY"; }
      delegated = "DELEGATED" { return "DELEGATED"; }
      project = "PROJECT" { return "PROJECT"; }
      idea = "IDEA" { return "IDEA"; }
      
      paragraph
        = !heading content:(!newline !heading .)+ newline+ {
            const contentText = content.map(c => c[1]).join('');
            return createParagraph([createText(contentText)]);
          }
        / !heading content:(!newline !heading .)+ {
            const contentText = content.map(c => c[1]).join('');
            return createParagraph([createText(contentText)]);
          }
      
      whitespace
        = [ \\t]+
      
      newline
        = "\\r\\n" / "\\n" / "\\r"
        
      asterisk = "*"
    `;
    
    // Create parser
    try {
      this.parser = pegjs.generate(this.grammar);
    } catch (error) {
      console.error('Error generating parser:', error);
      throw new Error('Failed to generate parser');
    }
  }

  /**
   * Parse Org Mode text
   * 
   * @param text The text to parse
   * @returns The parsed document
   */
  public parse(text: string): Document {
    try {
      // Parse the text
      const ast = this.parser.parse(text);
      
      // Create a document from the AST
      const document = new Document();
      
      // Add children
      if (ast.children) {
        ast.children.forEach((child: any) => {
          if (child) { // Skip null values
            document.appendChild(this.createNode(child));
          }
        });
      }
      
      // Apply plugins
      this.applyPlugins(document);
      
      return document;
    } catch (error) {
      console.error('Error parsing document:', error);
      throw new Error(`Failed to parse document: ${(error as Error).message}`);
    }
  }

  /**
   * Create a node from an AST node
   * 
   * @param astNode The AST node
   * @returns The node
   */
  private createNode(astNode: any): Node {
    if (!astNode || !astNode.type) {
      throw new Error('Invalid AST node: missing type');
    }
    
    const node = new Node(astNode.type);
    
    // Copy properties
    Object.keys(astNode).forEach(key => {
      if (key !== 'type' && key !== 'children') {
        node[key] = astNode[key];
      }
    });
    
    // Add children
    if (astNode.children) {
      astNode.children.forEach((child: any) => {
        if (child) { // Skip null values
          node.appendChild(this.createNode(child));
        }
      });
    }
    
    return node;
  }

  /**
   * Apply plugins to a document
   * 
   * @param document The document
   */
  private applyPlugins(_document: Document): void {
    // Apply tokenizers
    this.plugins.forEach(plugin => {
      if (plugin.tokenizers) {
        plugin.tokenizers.forEach(_tokenizer => {
          // Apply tokenizer to document
          // This would involve traversing the document and applying the tokenizer
          // to text nodes that match the pattern
        });
      }
    });
    
    // Apply processors
    this.plugins.forEach(plugin => {
      if (plugin.processors) {
        plugin.processors.forEach(_processor => {
          // Apply processor to document
          // This would involve traversing the document and applying the processor
          // to nodes of the specified type
        });
      }
    });
  }
}

/**
 * Create a new parser
 * 
 * @param options Parser options
 * @returns A new parser
 */
export function createParser(options: ParseOptions = {}): Parser {
  return new Parser(options);
} 