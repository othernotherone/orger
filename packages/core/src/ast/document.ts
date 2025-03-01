/**
 * Document class implementation
 */
import { DocumentNode } from './types';
import { Node } from './node';

/**
 * Document class - represents an Org Mode document
 */
export class Document extends Node implements DocumentNode {
  /** The type of the node */
  public type: 'document' = 'document';
  /** The children of the document */
  public children: Node[] = [];
  /** Document properties */
  public properties: DocumentNode['properties'] = {};

  /**
   * Create a new Document
   * 
   * @param props Additional properties for the document
   */
  constructor(props: Partial<DocumentNode> = {}) {
    super('document', props);
    
    // Initialize properties if not provided
    if (!this.properties) {
      this.properties = {};
    }
  }

  /**
   * Set a document property
   * 
   * @param key The property key
   * @param value The property value
   * @returns This document
   */
  public setProperty(key: string, value: any): Document {
    this.properties[key] = value;
    return this;
  }

  /**
   * Get a document property
   * 
   * @param key The property key
   * @returns The property value, or undefined if not found
   */
  public getProperty(key: string): any {
    return this.properties[key];
  }

  /**
   * Get the title of the document
   * 
   * @returns The title, or undefined if not set
   */
  public getTitle(): string | undefined {
    return this.properties.title;
  }

  /**
   * Set the title of the document
   * 
   * @param title The title to set
   * @returns This document
   */
  public setTitle(title: string): Document {
    this.properties.title = title;
    return this;
  }

  /**
   * Get the author of the document
   * 
   * @returns The author, or undefined if not set
   */
  public getAuthor(): string | undefined {
    return this.properties.author;
  }

  /**
   * Set the author of the document
   * 
   * @param author The author to set
   * @returns This document
   */
  public setAuthor(author: string): Document {
    this.properties.author = author;
    return this;
  }

  /**
   * Get the date of the document
   * 
   * @returns The date, or undefined if not set
   */
  public getDate(): string | undefined {
    return this.properties.date;
  }

  /**
   * Set the date of the document
   * 
   * @param date The date to set
   * @returns This document
   */
  public setDate(date: string): Document {
    this.properties.date = date;
    return this;
  }

  /**
   * Render the document to a different format
   * 
   * @param format The format to render to (e.g., 'html', 'markdown')
   * @param options Options for the renderer
   * @returns The rendered document
   */
  public render(format: string, options: Record<string, any> = {}): string {
    // This is a placeholder - actual rendering will be implemented in the renderer modules
    throw new Error(`Renderer for format '${format}' not implemented`);
  }

  /**
   * Clone this document
   * 
   * @param deep Whether to clone children recursively
   * @returns A clone of this document
   */
  public clone(deep = false): Document {
    const clone = new Document();
    
    // Copy properties
    clone.properties = { ...this.properties };
    
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