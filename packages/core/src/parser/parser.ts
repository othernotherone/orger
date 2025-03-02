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
        
        function createList(items, ordered) {
          return {
            type: 'list',
            listType: ordered ? 'ordered' : 'unordered',
            children: items || []
          };
        }
        
        function createListItem(content, children, ordered) {
          const item = {
            type: 'list_item',
            children: content || [],
            ordered: ordered
          };
          
          if (children && children.length > 0) {
            item.children = item.children.concat(children.filter(Boolean));
          }
          
          return item;
        }
        
        // Helper function to process list items with proper nesting
        function processListItems(items) {
          if (!items || items.length === 0) return [];
          
          const result = [];
          let currentItem = null;
          let currentLevel = 0;
          let stack = [{ level: 0, items: result }];
          
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const level = item.indentLevel || 0;
            
            // Remove the temporary property
            delete item.indentLevel;
            
            if (level > currentLevel) {
              // This is a nested item
              if (currentItem) {
                // Create a new list for the nested items
                const nestedList = {
                  type: 'list',
                  listType: item.ordered ? 'ordered' : 'unordered',
                  children: []
                };
                
                // Add the nested list to the current item
                currentItem.children.push(nestedList);
                
                // Update the stack
                stack.push({ level: level, items: nestedList.children });
              }
            } else if (level < currentLevel) {
              // Going back up the hierarchy
              while (stack.length > 1 && stack[stack.length - 1].level > level) {
                stack.pop();
              }
            }
            
            // Add the item to the current level
            stack[stack.length - 1].items.push(item);
            
            currentItem = item;
            currentLevel = level;
          }
          
          return result;
        }
      }
      
      document
        = newline* children:(heading / list / paragraph / empty_line)* {
            return createDocument(children.filter(Boolean));
          }
      
      heading
        = stars:asterisk+ whitespace todo_keyword:todo_keyword? title:(!newline .)* newline children:(heading / list / paragraph / empty_line)* {
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
      
      list
        = raw_items:list_item+ {
            // Process the raw items to create a properly nested list
            const firstItem = raw_items[0];
            const ordered = firstItem.ordered;
            
            // Process the items to create the proper hierarchy
            const items = processListItems(raw_items);
            
            // Create the list
            const list = createList(items, ordered);
            
            return list;
          }
      
      list_item
        = indent:whitespace? marker:list_marker whitespace content:(!newline .)* newline {
            // Check if this is an ordered list item by looking at the marker type
            const isOrdered = typeof marker === 'string' ? marker.indexOf('.') > 0 : false;
            
            // Process content
            const contentText = content.map(c => c[1]).join('');
            const contentNodes = [createText(contentText)];
            
            // Create the list item
            const item = createListItem(contentNodes, [], isOrdered);
            
            // Store the indentation level for later processing
            item.indentLevel = indent ? indent.length : 0;
            
            return item;
          }
      
      list_marker
        = marker:("-" / "+" / "*") { return marker; }
        / number:[0-9]+ "." { return number.join('') + "."; }
      
      paragraph
        = !heading !list content:(!newline !heading !list .)+ newline+ {
            const contentText = content.map(c => c[1]).join('');
            return createParagraph([createText(contentText)]);
          }
        / !heading !list content:(!newline !heading !list .)+ {
            const contentText = content.map(c => c[1]).join('');
            return createParagraph([createText(contentText)]);
          }
      
      empty_line
        = newline {
            return null;
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