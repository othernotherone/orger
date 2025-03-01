/**
 * Base node interface for all AST nodes
 */
export interface Node {
  type: string;
  position?: Position;
}

/**
 * Position information for a node
 */
export interface Position {
  start: { line: number; column: number; offset: number };
  end: { line: number; column: number; offset: number };
}

/**
 * Root document node
 */
export interface Document extends Node {
  type: 'document';
  properties: { [key: string]: string };
  children: Section[];
}

/**
 * Section node (contains a heading and content)
 */
export interface Section extends Node {
  type: 'section';
  heading?: Heading;
  properties: { [key: string]: string };
  children: (Paragraph | List | Table | CodeBlock | Section)[];
}

/**
 * Heading node
 */
export interface Heading extends Node {
  type: 'heading';
  level: number;
  title: string;
  tags: string[];
  todoKeyword?: string;
  priority?: string;
}

/**
 * Paragraph node
 */
export interface Paragraph extends Node {
  type: 'paragraph';
  children: (Text | FormattedText | Link)[];
}

/**
 * Plain text node
 */
export interface Text extends Node {
  type: 'text';
  value: string;
}

/**
 * Formatted text node (bold, italic, etc.)
 */
export interface FormattedText extends Node {
  type: 'formatted';
  format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'verbatim';
  children: (Text | FormattedText | Link)[];
}

/**
 * Link node
 */
export interface Link extends Node {
  type: 'link';
  protocol: string;
  path: string;
  description?: string;
}

/**
 * List node
 */
export interface List extends Node {
  type: 'list';
  ordered: boolean;
  items: ListItem[];
}

/**
 * List item node
 */
export interface ListItem extends Node {
  type: 'list_item';
  bullet: string;
  children: (Paragraph | List)[];
  checkbox?: 'unchecked' | 'checked' | 'partial';
}

/**
 * Table node
 */
export interface Table extends Node {
  type: 'table';
  rows: TableRow[];
}

/**
 * Table row node
 */
export interface TableRow extends Node {
  type: 'table_row';
  cells: TableCell[];
  isHeader: boolean;
}

/**
 * Table cell node
 */
export interface TableCell extends Node {
  type: 'table_cell';
  children: (Text | FormattedText | Link)[];
}

/**
 * Code block node
 */
export interface CodeBlock extends Node {
  type: 'code_block';
  language?: string;
  value: string;
  params?: { [key: string]: string };
}

/**
 * Comment node
 */
export interface Comment extends Node {
  type: 'comment';
  value: string;
}

/**
 * Union type of all possible node types
 */
export type AstNode =
  | Document
  | Section
  | Heading
  | Paragraph
  | Text
  | FormattedText
  | Link
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell
  | CodeBlock
  | Comment; 