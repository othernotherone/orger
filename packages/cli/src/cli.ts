#!/usr/bin/env node
/**
 * Command-line interface for Orger
 */
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { Parser } from '../../core/src/parser/parser';
import { Document } from '../../core/src/ast/document';
import { HtmlRenderer } from '../../core/src/renderer/html';
import { MarkdownRenderer } from '../../core/src/renderer/markdown';

const program = new Command();

// Get package version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

program
  .name('orger')
  .description('Org Mode parser and renderer')
  .version(packageJson.version);

program
  .command('parse')
  .description('Parse an Org Mode file and output the AST')
  .argument('<file>', 'Org Mode file to parse')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('-p, --pretty', 'Pretty print the output', false)
  .action((file, options) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const parser = new Parser();
      const doc = parser.parse(content);
      const output = JSON.stringify(doc, null, options.pretty ? 2 : 0);
      
      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(chalk.green(`AST written to ${options.output}`));
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program
  .command('render')
  .description('Render an Org Mode file to HTML or Markdown')
  .argument('<file>', 'Org Mode file to render')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('-f, --format <format>', 'Output format (html or markdown)', 'html')
  .option('--full-document', 'Generate a full HTML document (for HTML format)', false)
  .option('--gfm', 'Use GitHub Flavored Markdown (for Markdown format)', false)
  .option('--frontmatter', 'Include frontmatter (for Markdown format)', false)
  .action((file, options) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const parser = new Parser();
      const doc = parser.parse(content);
      
      let output: string;
      if (options.format === 'html') {
        const renderer = new HtmlRenderer();
        output = renderer.render(doc, {
          fullDocument: options.fullDocument
        });
      } else if (options.format === 'markdown') {
        const renderer = new MarkdownRenderer();
        output = renderer.render(doc, {
          gfm: options.gfm,
          frontmatter: options.frontmatter
        });
      } else {
        console.error(chalk.red(`Error: Unsupported format: ${options.format}`));
        process.exit(1);
      }
      
      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(chalk.green(`Rendered to ${options.output}`));
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program.parse(process.argv); 