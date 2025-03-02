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
            properties: {},
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
        
        function createText(value) {
          return {
            type: 'text',
            value: value || ''
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
            ordered: ordered,
            children: content || []
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
        = content:(!heading !list_item !newline .)+ newline* {
            const textContent = content.map(c => c[3]).join('');
            
            return {
              type: 'paragraph',
              children: [createText(textContent)]
            };
          }
        / newline+ {
            return {
              type: 'paragraph',
              children: [createText('')]
            };
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

      checkbox
        = "[" whitespace? "]" whitespace {
            return false;
          }
        / "[" ("X" / "x") "]" whitespace {
            return true;
          }
        / "[" "-" "]" whitespace {
            return null; // Partial/in progress
          }
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
      // Pre-process text to handle strikethrough markup
      // This ensures +strikethrough+ isn't confused with list markers
      const processedText = this.preProcessStrikethrough(text);
      
      // Parse the text
      const ast = this.parser.parse(processedText);
      
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
      
      // Process text markup
      this.processTextMarkup(document);
      
      // Apply plugins
      this.applyPlugins(document);
      
      return document;
    } catch (error) {
      console.error('Error parsing document:', error);
      throw new Error(`Failed to parse document: ${(error as Error).message}`);
    }
  }

  /**
   * Pre-process text to handle strikethrough markup
   * This temporarily replaces +strikethrough+ with a special marker
   * to prevent it from being confused with list markers
   * 
   * @param text The text to pre-process
   * @returns The pre-processed text
   */
  private preProcessStrikethrough(text: string): string {
    // Replace +strikethrough+ with a temporary marker
    // Only match when there are no spaces between the + signs
    return text.replace(/\+([^\s+][^+\n]*[^\s+])\+/g, '§§STRIKETHROUGH§§$1§§ENDSTRIKETHROUGH§§');
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
   * Process text markup in the document
   * 
   * @param node The node to process
   */
  private processTextMarkup(node: Node): void {
    // Process text nodes
    if (node.type === 'text') {
      const value = node.value as string;
      if (value && typeof value === 'string') {
        const parent = node.parent;
        if (parent && parent.children) {
          // Replace the text node with processed nodes
          const processedNodes = this.processTextMarkupInString(value);
          if (processedNodes.length > 0) {
            const index = parent.children.indexOf(node);
            if (index !== -1) {
              // Remove the original node
              parent.children.splice(index, 1);
              
              // Add the processed nodes
              for (let i = 0; i < processedNodes.length; i++) {
                if (parent.children) {
                  parent.children.splice(index + i, 0, processedNodes[i]);
                }
              }
            }
          }
        }
      }
    }
    
    // Process children
    if (node.children && node.children.length > 0) {
      // Create a copy of the children array to avoid issues with modification during iteration
      const children = [...node.children];
      children.forEach(child => {
        this.processTextMarkup(child);
      });
    }
  }

  /**
   * Process text markup in a string
   * 
   * @param text The text to process
   * @returns The processed nodes
   */
  private processTextMarkupInString(text: string): Node[] {
    if (!text) return [new Node('text', { value: '' })];
    
    // Start with a single text node
    let nodes: Node[] = [new Node('text', { value: text })];
    
    // Process each markup type in sequence
    nodes = this.processBold(nodes);
    nodes = this.processItalic(nodes);
    nodes = this.processUnderline(nodes);
    nodes = this.processStrikeThrough(nodes);
    nodes = this.processCode(nodes);
    nodes = this.processVerbatim(nodes);
    
    return nodes;
  }

  /**
   * Process bold markup in nodes
   * 
   * @param nodes The nodes to process
   * @returns The processed nodes
   */
  private processBold(nodes: Node[]): Node[] {
    const result: Node[] = [];
    
    for (const node of nodes) {
      if (node.type !== 'text') {
        result.push(node);
        continue;
      }
      
      const text = node.value as string;
      if (!text) {
        result.push(node);
        continue;
      }
      
      let lastIndex = 0;
      const boldRegex = /\*([^*\n]+)\*/g;
      let match;
      const segments: Node[] = [];
      
      while ((match = boldRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          segments.push(new Node('text', { value: text.substring(lastIndex, match.index) }));
        }
        
        // Add the bold node
        const boldNode = new Node('bold');
        const contentNode = new Node('text', { value: match[1] });
        boldNode.appendChild(contentNode);
        segments.push(boldNode);
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < text.length) {
        segments.push(new Node('text', { value: text.substring(lastIndex) }));
      }
      
      // If no segments were created, keep the original node
      if (segments.length === 0) {
        result.push(node);
      } else {
        result.push(...segments);
      }
    }
    
    return result;
  }

  /**
   * Process italic markup in nodes
   * 
   * @param nodes The nodes to process
   * @returns The processed nodes
   */
  private processItalic(nodes: Node[]): Node[] {
    const result: Node[] = [];
    
    for (const node of nodes) {
      if (node.type !== 'text') {
        result.push(node);
        continue;
      }
      
      const text = node.value as string;
      if (!text) {
        result.push(node);
        continue;
      }
      
      let lastIndex = 0;
      const italicRegex = /\/([^\/\n]+)\//g;
      let match;
      const segments: Node[] = [];
      
      while ((match = italicRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          segments.push(new Node('text', { value: text.substring(lastIndex, match.index) }));
        }
        
        // Add the italic node
        const italicNode = new Node('italic');
        const contentNode = new Node('text', { value: match[1] });
        italicNode.appendChild(contentNode);
        segments.push(italicNode);
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < text.length) {
        segments.push(new Node('text', { value: text.substring(lastIndex) }));
      }
      
      // If no segments were created, keep the original node
      if (segments.length === 0) {
        result.push(node);
      } else {
        result.push(...segments);
      }
    }
    
    return result;
  }

  /**
   * Process underline markup in nodes
   * 
   * @param nodes The nodes to process
   * @returns The processed nodes
   */
  private processUnderline(nodes: Node[]): Node[] {
    const result: Node[] = [];
    
    for (const node of nodes) {
      if (node.type !== 'text') {
        result.push(node);
        continue;
      }
      
      const text = node.value as string;
      if (!text) {
        result.push(node);
        continue;
      }
      
      let lastIndex = 0;
      const underlineRegex = /_([^_\n]+)_/g;
      let match;
      const segments: Node[] = [];
      
      while ((match = underlineRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          segments.push(new Node('text', { value: text.substring(lastIndex, match.index) }));
        }
        
        // Add the underline node
        const underlineNode = new Node('underline');
        const contentNode = new Node('text', { value: match[1] });
        underlineNode.appendChild(contentNode);
        segments.push(underlineNode);
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < text.length) {
        segments.push(new Node('text', { value: text.substring(lastIndex) }));
      }
      
      // If no segments were created, keep the original node
      if (segments.length === 0) {
        result.push(node);
      } else {
        result.push(...segments);
      }
    }
    
    return result;
  }

  /**
   * Process strikethrough markup in nodes
   * 
   * @param nodes The nodes to process
   * @returns The processed nodes
   */
  private processStrikeThrough(nodes: Node[]): Node[] {
    const result: Node[] = [];
    
    for (const node of nodes) {
      if (node.type !== 'text') {
        result.push(node);
        continue;
      }
      
      const text = node.value as string;
      if (!text) {
        result.push(node);
        continue;
      }
      
      let lastIndex = 0;
      // Look for our special marker or the original +text+ pattern
      const strikethroughRegex = /§§STRIKETHROUGH§§([^§]+)§§ENDSTRIKETHROUGH§§|\+([^+\n]+)\+/g;
      let match;
      const segments: Node[] = [];
      
      while ((match = strikethroughRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          segments.push(new Node('text', { value: text.substring(lastIndex, match.index) }));
        }
        
        // Add the strikethrough node
        const strikethroughNode = new Node('strikethrough');
        // Use the first capturing group that matched (either the special marker or the original pattern)
        const content = match[1] || match[2];
        const contentNode = new Node('text', { value: content });
        strikethroughNode.appendChild(contentNode);
        segments.push(strikethroughNode);
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < text.length) {
        segments.push(new Node('text', { value: text.substring(lastIndex) }));
      }
      
      // If no segments were created, keep the original node
      if (segments.length === 0) {
        result.push(node);
      } else {
        result.push(...segments);
      }
    }
    
    return result;
  }

  /**
   * Process code markup in nodes
   * 
   * @param nodes The nodes to process
   * @returns The processed nodes
   */
  private processCode(nodes: Node[]): Node[] {
    const result: Node[] = [];
    
    for (const node of nodes) {
      if (node.type !== 'text') {
        result.push(node);
        continue;
      }
      
      const text = node.value as string;
      if (!text) {
        result.push(node);
        continue;
      }
      
      let lastIndex = 0;
      const codeRegex = /~([^~\n]+)~/g;
      let match;
      const segments: Node[] = [];
      
      while ((match = codeRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          segments.push(new Node('text', { value: text.substring(lastIndex, match.index) }));
        }
        
        // Add the code node
        const codeNode = new Node('code', { value: match[1] });
        segments.push(codeNode);
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < text.length) {
        segments.push(new Node('text', { value: text.substring(lastIndex) }));
      }
      
      // If no segments were created, keep the original node
      if (segments.length === 0) {
        result.push(node);
      } else {
        result.push(...segments);
      }
    }
    
    return result;
  }

  /**
   * Process verbatim markup in nodes
   * 
   * @param nodes The nodes to process
   * @returns The processed nodes
   */
  private processVerbatim(nodes: Node[]): Node[] {
    const result: Node[] = [];
    
    for (const node of nodes) {
      if (node.type !== 'text') {
        result.push(node);
        continue;
      }
      
      const text = node.value as string;
      if (!text) {
        result.push(node);
        continue;
      }
      
      let lastIndex = 0;
      const verbatimRegex = /=([^=\n]+)=/g;
      let match;
      const segments: Node[] = [];
      
      while ((match = verbatimRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          segments.push(new Node('text', { value: text.substring(lastIndex, match.index) }));
        }
        
        // Add the verbatim node
        const verbatimNode = new Node('verbatim', { value: match[1] });
        segments.push(verbatimNode);
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < text.length) {
        segments.push(new Node('text', { value: text.substring(lastIndex) }));
      }
      
      // If no segments were created, keep the original node
      if (segments.length === 0) {
        result.push(node);
      } else {
        result.push(...segments);
      }
    }
    
    return result;
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