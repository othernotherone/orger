# Contributing to Orger

Thank you for your interest in contributing to Orger! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/orger.git
   cd orger
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the packages:
   ```bash
   npm run build
   ```

## Project Structure

The project is organized as a monorepo with the following packages:

- `packages/core`: The main parser and renderer implementation
- `packages/cli`: Command-line interface for the parser

## Development Workflow

### Running Tests

Run tests for all packages:

```bash
npm test
```

Run tests for a specific package:

```bash
cd packages/core
npm test
```

### Linting

Lint all packages:

```bash
npm run lint
```

Lint a specific package:

```bash
cd packages/core
npm run lint
```

### Building

Build all packages:

```bash
npm run build
```

Build a specific package:

```bash
cd packages/core
npm run build
```

## Making Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure they pass all tests and linting

3. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

4. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request from your fork to the main repository

## Pull Request Guidelines

- Ensure your code passes all tests and linting
- Include tests for new features or bug fixes
- Update documentation as needed
- Keep pull requests focused on a single change
- Follow the existing code style and conventions

## Adding New Features

When adding new features, please consider the following:

1. Discuss major changes in an issue before implementing
2. Ensure the feature is well-tested
3. Update documentation to reflect the new feature
4. Consider backward compatibility

## Extending the Parser

The parser is designed to be extensible through plugins. If you want to add support for new Org Mode features:

1. Check if it can be implemented as a plugin first
2. If it requires core changes, discuss in an issue
3. Add appropriate tests for the new functionality

## Documentation

Please update the documentation when making changes:

- Update README.md for user-facing changes
- Update JSDoc comments for API changes
- Update examples if relevant

## Release Process

The maintainers will handle releases. If you think a release is needed, please open an issue.

## Getting Help

If you need help with contributing, please:

1. Check the documentation
2. Open an issue with your question

Thank you for contributing to Orger! 