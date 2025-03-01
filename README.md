# Orger: A Universal Org Mode Parser

Orger is an open-source project aimed at making Org Mode accessible beyond Emacs. It provides a standalone, language-agnostic parser for Org Mode documents that can be embedded in various applications.

## Vision

Org Mode is a powerful markup language and organizational tool, but it's traditionally been tied to Emacs. Orger aims to:

- Create a standalone, language-agnostic Org Mode parser specification
- Implement reference parsers in multiple languages
- Provide a consistent API across implementations
- Support core Org Mode features while allowing for extensibility
- Make it easy for developers to embed in any application

## Project Structure

Orger is organized as a monorepo with the following packages:

- `@orger/core`: The core parser implementation in TypeScript
- `@orger/cli`: Command-line interface for Orger
- `@orger/web`: Web components and browser integration
- Additional language bindings and integrations will be added over time

## Features

### Current Features (v0.1.0)

- Document structure (headings, sections)
- Basic formatting (bold, italic, underline, etc.)
- Lists (ordered, unordered, description)
- Links
- Tables (basic)
- Code blocks (without execution)
- Comments

### Planned Features

- TODO items and priorities
- Tags and properties
- Timestamps and scheduling
- Footnotes
- Drawers
- File includes
- Babel code execution
- Advanced table formulas
- Agenda views
- Export backends
- Custom link types

## Getting Started

```bash
# Install the core package
npm install @orger/core

# Or use the CLI
npm install -g @orger/cli
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

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 