/**
 * Tests for the core package
 */
import { parse } from './index';
import { Document } from './ast/document';
import { Node } from './ast/node';

describe('Orger Core', () => {
  describe('parse', () => {
    it('should parse a simple document', () => {
      const text = '* Heading\nSome content';
      const doc = parse(text);
      
      expect(doc).toBeInstanceOf(Document);
      expect(doc.children.length).toBe(1);
      
      const heading = doc.children[0];
      expect(heading.type).toBe('heading');
      expect(heading.level).toBe(1);
      expect(heading.title).toBe('Heading');
      
      expect(heading.children.length).toBe(1);
      const paragraph = heading.children[0];
      expect(paragraph.type).toBe('paragraph');
      
      const textNode = paragraph.children[0];
      expect(textNode.type).toBe('text');
      expect(textNode.value).toBe('Some content');
    });
    
    it('should handle multiple headings', () => {
      const text = '* Heading 1\nContent 1\n** Heading 2\nContent 2\n* Heading 3\nContent 3';
      const doc = parse(text);
      
      expect(doc.children.length).toBe(2);
      
      const heading1 = doc.children[0];
      expect(heading1.type).toBe('heading');
      expect(heading1.level).toBe(1);
      expect(heading1.title).toBe('Heading 1');
      
      const heading2 = heading1.children[1];
      expect(heading2.type).toBe('heading');
      expect(heading2.level).toBe(2);
      expect(heading2.title).toBe('Heading 2');
      
      const heading3 = doc.children[1];
      expect(heading3.type).toBe('heading');
      expect(heading3.level).toBe(1);
      expect(heading3.title).toBe('Heading 3');
    });
    
    it('should handle TODO keywords', () => {
      const text = '* TODO Heading\nContent';
      const doc = parse(text, { todoKeywords: ['TODO', 'DONE'] });
      
      const heading = doc.children[0];
      expect(heading.todoKeyword).toBe('TODO');
      expect(heading.title).toBe('Heading');
    });
  });
  
  describe('Node', () => {
    it('should create a node with the correct type', () => {
      const node = new Node('test');
      expect(node.type).toBe('test');
    });
    
    it('should add and remove children', () => {
      const parent = new Node('parent');
      const child = new Node('child');
      
      parent.appendChild(child);
      expect(parent.children?.length).toBe(1);
      expect(parent.children?.[0]).toBe(child);
      expect(child.parent).toBe(parent);
      
      parent.removeChild(child);
      expect(parent.children?.length).toBe(0);
      expect(child.parent).toBeUndefined();
    });
    
    it('should find nodes by type', () => {
      const parent = new Node('parent');
      const child1 = new Node('child');
      const child2 = new Node('child');
      const grandchild = new Node('grandchild');
      
      parent.appendChild(child1);
      parent.appendChild(child2);
      child1.appendChild(grandchild);
      
      const children = parent.findAll('child');
      expect(children.length).toBe(2);
      expect(children).toContain(child1);
      expect(children).toContain(child2);
      
      const firstChild = parent.findOne('child');
      expect(firstChild).toBe(child1);
      
      const grandchildren = parent.findAll('grandchild');
      expect(grandchildren.length).toBe(1);
      expect(grandchildren[0]).toBe(grandchild);
    });
    
    it('should clone nodes', () => {
      const original = new Node('test', { value: 'test value' });
      const child = new Node('child');
      original.appendChild(child);
      
      const shallowClone = original.clone();
      expect(shallowClone.type).toBe('test');
      expect(shallowClone.value).toBe('test value');
      expect(shallowClone.children).toBeUndefined();
      
      const deepClone = original.clone(true);
      expect(deepClone.type).toBe('test');
      expect(deepClone.value).toBe('test value');
      expect(deepClone.children?.length).toBe(1);
      expect(deepClone.children?.[0].type).toBe('child');
      expect(deepClone.children?.[0].parent).toBe(deepClone);
    });
  });
  
  describe('Document', () => {
    it('should create a document with the correct type', () => {
      const doc = new Document();
      expect(doc.type).toBe('document');
      expect(doc.children).toEqual([]);
      expect(doc.properties).toEqual({});
    });
    
    it('should set and get properties', () => {
      const doc = new Document();
      
      doc.setProperty('title', 'Test Document');
      expect(doc.getProperty('title')).toBe('Test Document');
      expect(doc.getTitle()).toBe('Test Document');
      
      doc.setTitle('New Title');
      expect(doc.getTitle()).toBe('New Title');
      expect(doc.getProperty('title')).toBe('New Title');
      
      doc.setAuthor('Test Author');
      expect(doc.getAuthor()).toBe('Test Author');
      
      doc.setDate('2023-01-01');
      expect(doc.getDate()).toBe('2023-01-01');
    });
    
    it('should clone documents', () => {
      const original = new Document();
      original.setTitle('Test Document');
      const child = new Node('heading', { level: 1, title: 'Heading' });
      original.appendChild(child);
      
      const clone = original.clone(true);
      expect(clone.getTitle()).toBe('Test Document');
      expect(clone.children.length).toBe(1);
      expect(clone.children[0].type).toBe('heading');
      expect(clone.children[0].level).toBe(1);
      expect(clone.children[0].title).toBe('Heading');
      expect(clone.children[0].parent).toBe(clone);
    });
  });
}); 