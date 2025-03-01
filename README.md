# Orger

A language-agnostic parser and toolkit for Org Mode documents.

## Overview

Orger is an open-source project aimed at bringing the power of Org Mode beyond Emacs. It provides a standalone parser and toolkit that can be embedded in various applications across different platforms.

## Project Goals

- Create a standalone, language-agnostic Org Mode parser specification
- Implement reference parsers in multiple languages
- Provide a consistent API across implementations
- Support core Org Mode features while allowing for extensibility
- Make it easy for developers to embed in any application

## Project Structure

- `packages/core`: Core parser implementation
- `packages/cli`: Command-line interface
- `packages/web`: Web components and browser integration

## Features

### Phase 1 (Core Features)
- Document structure (headings, sections)
- Basic formatting (bold, italic, underline, etc.)
- Lists (ordered, unordered, description)
- Links
- Tables (basic)
- Code blocks (without execution)
- Comments

### Phase 2 (Advanced Features)
- TODO items and priorities
- Tags and properties
- Timestamps and scheduling
- Footnotes
- Drawers
- File includes

### Phase 3 (Extended Features)
- Babel code execution (with appropriate security measures)
- Advanced table formulas
- Agenda views
- Export backends
- Custom link types

## Getting Started

*Coming soon*

## License

MIT 