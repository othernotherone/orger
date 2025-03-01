#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
// Note: In a real implementation, we would use the actual @orger/core package
// For now, we'll just simulate it
const orger = {
  parse: (input) => ({ type: 'document', properties: {}, children: [] }),
  renderToHtml: (input) => '<div class="org-document"></div>'
};

program
  .name('orger')
  .description('Org Mode parser and toolkit')
  .version('0.1.0');

program
  .command('parse')
  .description('Parse an Org Mode file and output the AST')
  .argument('<file>', 'Org Mode file to parse')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .action((file, options) => {
    try {
      const input = fs.readFileSync(file, 'utf-8');
      const ast = orger.parse(input);
      const output = JSON.stringify(ast, null, 2);
      
      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(`AST written to ${options.output}`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('html')
  .description('Convert an Org Mode file to HTML')
  .argument('<file>', 'Org Mode file to convert')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .action((file, options) => {
    try {
      const input = fs.readFileSync(file, 'utf-8');
      const html = orger.renderToHtml(input);
      
      if (options.output) {
        fs.writeFileSync(options.output, html);
        console.log(`HTML written to ${options.output}`);
      } else {
        console.log(html);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(); 