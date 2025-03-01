import * as Types from './types';

/**
 * Create a document node
 */
export function createDocument(properties: { [key: string]: string } = {}): Types.Document {
  return {
    type: 'document',
    properties,
    children: [],
  };
}

/**
 * Create a section node
 */
export function createSection(heading?: Types.Heading): Types.Section {
  return {
    type: 'section',
    heading,
    properties: {},
    children: [],
  };
}

/**
 * Create a heading node
 */
export function createHeading(
  level: number,
  title: string,
  tags: string[] = [],
  todoKeyword?: string,
  priority?: string
): Types.Heading {
  return {
    type: 'heading',
    level,
    title,
    tags,
    todoKeyword,
    priority,
  };
}

/**
 * Create a paragraph node
 */
export function createParagraph(): Types.Paragraph {
  return {
    type: 'paragraph',
    children: [],
  };
}

/**
 * Create a text node
 */
export function createText(value: string): Types.Text {
  return {
    type: 'text',
    value,
  };
}

/**
 * Create a formatted text node
 */
export function createFormattedText(
  format: Types.FormattedText['format']
): Types.FormattedText {
  return {
    type: 'formatted',
    format,
    children: [],
  };
}

/**
 * Create a link node
 */
export function createLink(
  protocol: string,
  path: string,
  description?: string
): Types.Link {
  return {
    type: 'link',
    protocol,
    path,
    description,
  };
}

/**
 * Create a list node
 */
export function createList(ordered: boolean): Types.List {
  return {
    type: 'list',
    ordered,
    items: [],
  };
}

/**
 * Create a list item node
 */
export function createListItem(
  bullet: string,
  checkbox?: Types.ListItem['checkbox']
): Types.ListItem {
  return {
    type: 'list_item',
    bullet,
    children: [],
    checkbox,
  };
}

/**
 * Create a table node
 */
export function createTable(): Types.Table {
  return {
    type: 'table',
    rows: [],
  };
}

/**
 * Create a table row node
 */
export function createTableRow(isHeader: boolean = false): Types.TableRow {
  return {
    type: 'table_row',
    cells: [],
    isHeader,
  };
}

/**
 * Create a table cell node
 */
export function createTableCell(): Types.TableCell {
  return {
    type: 'table_cell',
    children: [],
  };
}

/**
 * Create a code block node
 */
export function createCodeBlock(
  value: string,
  language?: string,
  params?: { [key: string]: string }
): Types.CodeBlock {
  return {
    type: 'code_block',
    value,
    language,
    params,
  };
}

/**
 * Create a comment node
 */
export function createComment(value: string): Types.Comment {
  return {
    type: 'comment',
    value,
  };
} 