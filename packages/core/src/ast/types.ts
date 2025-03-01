/**
 * AST Types for Org Mode documents
 */

/**
 * Base interface for all AST nodes
 */
export interface Node {
  /** The type of the node */
  type: string;
  /** The parent node, if any */
  parent?: Node;
  /** The children of the node, if any */
  children?: Node[];
  /** The position of the node in the source text */
  position?: Position;
  /** Additional properties specific to the node type */
  [key: string]: any;
}

/**
 * Position information for a node
 */
export interface Position {
  /** The start position */
  start: {
    /** The line number (1-indexed) */
    line: number;
    /** The column number (1-indexed) */
    column: number;
    /** The offset in the source text */
    offset: number;
  };
  /** The end position */
  end: {
    /** The line number (1-indexed) */
    line: number;
    /** The column number (1-indexed) */
    column: number;
    /** The offset in the source text */
    offset: number;
  };
}

/**
 * Document node - the root of the AST
 */
export interface DocumentNode extends Node {
  type: 'document';
  children: Node[];
  properties: {
    /** The title of the document */
    title?: string;
    /** The author of the document */
    author?: string;
    /** The date of the document */
    date?: string;
    /** The email of the author */
    email?: string;
    /** Custom properties */
    [key: string]: any;
  };
}

/**
 * Heading node
 */
export interface HeadingNode extends Node {
  type: 'heading';
  /** The level of the heading (1-based) */
  level: number;
  /** The title/content of the heading */
  title: string;
  /** The TODO state, if any */
  todoKeyword?: string;
  /** The priority, if any */
  priority?: string;
  /** The tags, if any */
  tags?: string[];
  /** Whether the heading is archived */
  isArchived?: boolean;
  /** Whether the heading is commented */
  isCommented?: boolean;
  /** The children of the heading */
  children: Node[];
}

/**
 * Paragraph node
 */
export interface ParagraphNode extends Node {
  type: 'paragraph';
  children: Node[];
}

/**
 * Text node - represents plain text
 */
export interface TextNode extends Node {
  type: 'text';
  value: string;
}

/**
 * Bold node - represents bold text
 */
export interface BoldNode extends Node {
  type: 'bold';
  children: Node[];
}

/**
 * Italic node - represents italic text
 */
export interface ItalicNode extends Node {
  type: 'italic';
  children: Node[];
}

/**
 * Underline node - represents underlined text
 */
export interface UnderlineNode extends Node {
  type: 'underline';
  children: Node[];
}

/**
 * Strike-through node - represents strike-through text
 */
export interface StrikeThroughNode extends Node {
  type: 'strike_through';
  children: Node[];
}

/**
 * Code node - represents inline code
 */
export interface CodeNode extends Node {
  type: 'code';
  value: string;
}

/**
 * Verbatim node - represents verbatim text
 */
export interface VerbatimNode extends Node {
  type: 'verbatim';
  value: string;
}

/**
 * Link node - represents a link
 */
export interface LinkNode extends Node {
  type: 'link';
  /** The URL of the link */
  url: string;
  /** The description of the link, if any */
  description?: string;
  /** The protocol of the link (e.g., 'http', 'file', etc.) */
  protocol?: string;
}

/**
 * List node - represents a list
 */
export interface ListNode extends Node {
  type: 'list';
  /** The type of the list */
  listType: 'ordered' | 'unordered' | 'descriptive';
  /** The children of the list (list items) */
  children: ListItemNode[];
}

/**
 * List item node - represents an item in a list
 */
export interface ListItemNode extends Node {
  type: 'list_item';
  /** The bullet or number of the list item */
  bullet: string;
  /** Whether the item is checked (for checkbox lists) */
  checked?: boolean | null;
  /** The children of the list item */
  children: Node[];
}

/**
 * Table node - represents a table
 */
export interface TableNode extends Node {
  type: 'table';
  /** The children of the table (table rows) */
  children: TableRowNode[];
}

/**
 * Table row node - represents a row in a table
 */
export interface TableRowNode extends Node {
  type: 'table_row';
  /** Whether this is a header row */
  isHeader?: boolean;
  /** The children of the row (table cells) */
  children: TableCellNode[];
}

/**
 * Table cell node - represents a cell in a table
 */
export interface TableCellNode extends Node {
  type: 'table_cell';
  /** The content of the cell */
  children: Node[];
}

/**
 * Code block node - represents a block of code
 */
export interface CodeBlockNode extends Node {
  type: 'code_block';
  /** The language of the code block */
  language?: string;
  /** The content of the code block */
  value: string;
  /** Additional parameters for the code block */
  params?: Record<string, string>;
}

/**
 * Comment node - represents a comment
 */
export interface CommentNode extends Node {
  type: 'comment';
  /** The content of the comment */
  value: string;
}

/**
 * Horizontal rule node - represents a horizontal rule
 */
export interface HorizontalRuleNode extends Node {
  type: 'horizontal_rule';
}

/**
 * Drawer node - represents a property drawer
 */
export interface DrawerNode extends Node {
  type: 'drawer';
  /** The name of the drawer */
  name: string;
  /** The properties in the drawer */
  properties: Record<string, string>;
}

/**
 * Footnote node - represents a footnote
 */
export interface FootnoteNode extends Node {
  type: 'footnote';
  /** The label of the footnote */
  label: string;
  /** The content of the footnote */
  children: Node[];
}

/**
 * Footnote reference node - represents a reference to a footnote
 */
export interface FootnoteReferenceNode extends Node {
  type: 'footnote_reference';
  /** The label of the referenced footnote */
  label: string;
}

/**
 * Timestamp node - represents a timestamp
 */
export interface TimestampNode extends Node {
  type: 'timestamp';
  /** The type of timestamp */
  timestampType: 'active' | 'inactive' | 'diary';
  /** The date of the timestamp */
  date: Date;
  /** The time of the timestamp, if any */
  time?: {
    hour: number;
    minute: number;
  };
  /** The end date of the timestamp, if any (for ranges) */
  endDate?: Date;
  /** The end time of the timestamp, if any (for ranges) */
  endTime?: {
    hour: number;
    minute: number;
  };
  /** Whether the timestamp has a repeater */
  repeater?: {
    type: '+' | '++' | '.+';
    value: number;
    unit: 'h' | 'd' | 'w' | 'm' | 'y';
  };
  /** Whether the timestamp has a warning period */
  warning?: {
    type: '-' | '--';
    value: number;
    unit: 'h' | 'd' | 'w' | 'm' | 'y';
  };
} 