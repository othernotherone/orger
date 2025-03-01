/**
 * Base Node class implementation
 */
import { Node as NodeInterface, Position } from './types';

/**
 * Base class for all AST nodes
 */
export class Node implements NodeInterface {
  /** The type of the node */
  public type: string;
  /** The parent node, if any */
  public parent?: Node;
  /** The children of the node, if any */
  public children?: Node[];
  /** The position of the node in the source text */
  public position?: Position;
  /** Additional properties */
  [key: string]: any;

  /**
   * Create a new Node
   * 
   * @param type The type of the node
   * @param props Additional properties for the node
   */
  constructor(type: string, props: Partial<NodeInterface> = {}) {
    this.type = type;
    
    // Copy properties from props
    Object.entries(props).forEach(([key, value]) => {
      if (key !== 'type') {
        this[key] = value;
      }
    });

    // Initialize children array if not provided
    if (!this.children && ['document', 'heading', 'paragraph', 'list', 'list_item', 
                          'table', 'table_row', 'table_cell', 'bold', 'italic', 
                          'underline', 'strike_through', 'footnote'].includes(type)) {
      this.children = [];
    }
  }

  /**
   * Add a child node to this node
   * 
   * @param child The child node to add
   * @returns The added child node
   */
  public appendChild(child: Node): Node {
    if (!this.children) {
      this.children = [];
    }
    
    child.parent = this;
    this.children.push(child);
    return child;
  }

  /**
   * Remove a child node from this node
   * 
   * @param child The child node to remove
   * @returns The removed child node, or undefined if not found
   */
  public removeChild(child: Node): Node | undefined {
    if (!this.children) {
      return undefined;
    }
    
    const index = this.children.indexOf(child);
    if (index === -1) {
      return undefined;
    }
    
    const removed = this.children.splice(index, 1)[0];
    removed.parent = undefined;
    return removed;
  }

  /**
   * Find all nodes of a given type in this node's subtree
   * 
   * @param type The type of nodes to find
   * @returns An array of matching nodes
   */
  public findAll(type: string): Node[] {
    const result: Node[] = [];
    
    // Check if this node matches
    if (this.type === type) {
      result.push(this);
    }
    
    // Check children recursively
    if (this.children) {
      for (const child of this.children) {
        result.push(...child.findAll(type));
      }
    }
    
    return result;
  }

  /**
   * Find the first node of a given type in this node's subtree
   * 
   * @param type The type of node to find
   * @returns The first matching node, or undefined if not found
   */
  public findOne(type: string): Node | undefined {
    // Check if this node matches
    if (this.type === type) {
      return this;
    }
    
    // Check children recursively
    if (this.children) {
      for (const child of this.children) {
        const found = child.findOne(type);
        if (found) {
          return found;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Get the path from the root to this node
   * 
   * @returns An array of nodes from the root to this node
   */
  public getPath(): Node[] {
    const path: Node[] = [this];
    let current: Node | undefined = this.parent;
    
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    
    return path;
  }

  /**
   * Get the depth of this node in the tree
   * 
   * @returns The depth of the node (0 for root)
   */
  public getDepth(): number {
    let depth = 0;
    let current: Node | undefined = this.parent;
    
    while (current) {
      depth++;
      current = current.parent;
    }
    
    return depth;
  }

  /**
   * Clone this node
   * 
   * @param deep Whether to clone children recursively
   * @returns A clone of this node
   */
  public clone(deep = false): Node {
    const clone = new Node(this.type);
    
    // Copy properties
    Object.entries(this).forEach(([key, value]) => {
      if (key !== 'type' && key !== 'parent' && key !== 'children') {
        clone[key] = value;
      }
    });
    
    // Clone children if deep
    if (deep && this.children) {
      clone.children = this.children.map(child => {
        const childClone = child.clone(true);
        childClone.parent = clone;
        return childClone;
      });
    }
    
    return clone;
  }
} 