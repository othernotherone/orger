# @orger/core

The core parser implementation for Orger - a universal Org Mode parser that can be embedded in any application.

## Installation

```bash
npm install @orger/core
```

## Usage

```javascript
import { parse } from '@orger/core';

// Parse Org Mode content
const ast = parse('* Heading\nSome content');

// Query the AST
const headings = ast.findAll('heading');

// Render to different formats
const html = ast.render('html');
const markdown = ast.render('markdown');
```

## API

### `parse(text: string, options?: ParseOptions): Document`

Parses Org Mode text and returns an AST.

#### Options

- `strict` (boolean): Whether to throw errors on invalid syntax (default: false)
- `defaultTodoKeywords` (string[]): Custom TODO keywords (default: ['TODO', 'DONE'])
- `plugins` (Plugin[]): Custom plugins to extend the parser

### `Document`

The root node of the AST.

#### Properties

- `type`: Always 'document'
- `children`: Array of nodes
- `properties`: Document properties

#### Methods

- `findAll(type: string)`: Find all nodes of a given type
- `findOne(type: string)`: Find the first node of a given type
- `render(format: string)`: Render the document to a different format

### Node Types

- `heading`: A heading node
- `paragraph`: A paragraph node
- `list`: A list node
- `list_item`: A list item node
- `table`: A table node
- `table_row`: A table row node
- `table_cell`: A table cell node
- `code_block`: A code block node
- `inline_code`: An inline code node
- `bold`: A bold text node
- `italic`: An italic text node
- `underline`: An underlined text node
- `strike_through`: A strike-through text node
- `link`: A link node
- `comment`: A comment node

## Contributing

Contributions are welcome! Please see the main [CONTRIBUTING.md](../../CONTRIBUTING.md) file for details. 