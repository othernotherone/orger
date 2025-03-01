{
  const ast = require('../ast');
}

// Document is the root node
Document
  = properties:DocumentProperties? content:Content
  {
    const doc = ast.createDocument(properties || {});
    doc.children = content;
    return doc;
  }

// Document properties (#+TITLE:, #+AUTHOR:, etc.)
DocumentProperties
  = props:(DocumentProperty)*
  {
    return props.reduce((acc, prop) => {
      acc[prop.key] = prop.value;
      return acc;
    }, {});
  }

DocumentProperty
  = "#+" key:PropertyKey ":" _ value:PropertyValue Newline
  {
    return { key, value };
  }

PropertyKey
  = chars:[A-Z_]+ { return chars.join(''); }

PropertyValue
  = chars:[^\n]* { return chars.join('').trim(); }

// Content is a sequence of sections
Content
  = sections:(Section)*
  {
    // If there are no explicit sections, create an implicit one
    if (sections.length === 0) {
      const section = ast.createSection();
      return [section];
    }
    return sections;
  }

// Section starts with a heading and contains content
Section
  = heading:Heading content:SectionContent
  {
    const section = ast.createSection(heading);
    section.children = content;
    return section;
  }

// Heading (*, **, ***, etc.)
Heading
  = stars:Stars _ todoKeyword:TodoKeyword? priority:Priority? _ title:HeadingTitle tags:HeadingTags? Newline
  {
    return ast.createHeading(
      stars.length,
      title,
      tags || [],
      todoKeyword,
      priority
    );
  }

Stars
  = stars:"*"+ { return stars; }

TodoKeyword
  = keyword:("TODO" / "DONE") _ { return keyword; }

Priority
  = "[#" priority:[A-C] "]" _ { return priority; }

HeadingTitle
  = chars:[^:\n]+ { return chars.join('').trim(); }

HeadingTags
  = _ ":" tags:(TagName ":")+ 
  { 
    return tags.map(t => t[0]); 
  }

TagName
  = chars:[A-Za-z0-9_@]+ { return chars.join(''); }

// Section content is a sequence of blocks
SectionContent
  = blocks:(Paragraph / List / Table / CodeBlock)*
  {
    return blocks;
  }

// Paragraph is a sequence of lines
Paragraph
  = lines:ParagraphLine+ BlankLine*
  {
    const paragraph = ast.createParagraph();
    // Process inline formatting
    paragraph.children = [ast.createText(lines.join('\n'))];
    return paragraph;
  }

ParagraphLine
  = !Stars !ListMarker !TableRow !CodeBlockStart chars:[^\n]+ Newline
  {
    return chars.join('');
  }

// List (ordered and unordered)
List
  = items:ListItem+
  {
    // Determine if list is ordered based on first item
    const ordered = items[0].bullet.match(/^\d+[.)]/) !== null;
    const list = ast.createList(ordered);
    list.items = items;
    return list;
  }

ListItem
  = indent:Whitespace bullet:ListMarker _ checkbox:ListCheckbox? content:ListItemContent
  {
    const item = ast.createListItem(bullet, checkbox);
    
    // Create paragraph for content
    const para = ast.createParagraph();
    para.children = [ast.createText(content)];
    item.children = [para];
    
    return item;
  }

ListMarker
  = marker:("- " / "+ " / "* " / [0-9]+ [.)] " )
  {
    return marker.join ? marker.join('') : marker;
  }

ListCheckbox
  = "[" status:(" " / "X" / "-") "]" _
  {
    if (status === " ") return "unchecked";
    if (status === "X") return "checked";
    return "partial";
  }

ListItemContent
  = chars:[^\n]+ Newline
  {
    return chars.join('');
  }

// Table
Table
  = rows:TableRow+ BlankLine*
  {
    const table = ast.createTable();
    table.rows = rows;
    return table;
  }

TableRow
  = "|" cells:TableCell+ "|" Newline separator:TableSeparator?
  {
    const row = ast.createTableRow(false);
    row.cells = cells;
    
    // If this row is followed by a separator, it's a header
    if (separator) {
      row.isHeader = true;
    }
    
    return row;
  }

TableCell
  = content:TableCellContent "|"
  {
    const cell = ast.createTableCell();
    cell.children = [ast.createText(content)];
    return cell;
  }

TableCellContent
  = chars:[^|\n]* { return chars.join('').trim(); }

TableSeparator
  = "|" ("-"+) ("|" ("-"+))* "|" Newline { return true; }

// Code Block
CodeBlock
  = start:CodeBlockStart content:CodeBlockContent end:CodeBlockEnd
  {
    return ast.createCodeBlock(content, start.language, start.params);
  }

CodeBlockStart
  = "#+BEGIN_SRC" _ language:CodeBlockLanguage? params:CodeBlockParams? Newline
  {
    return {
      language: language || undefined,
      params: params || {}
    };
  }

CodeBlockLanguage
  = chars:[a-zA-Z0-9_-]+ _ { return chars.join(''); }

CodeBlockParams
  = params:CodeBlockParam+ { return params.reduce((acc, p) => ({ ...acc, ...p }), {}); }

CodeBlockParam
  = key:CodeBlockParamKey "=" value:CodeBlockParamValue _
  {
    return { [key]: value };
  }

CodeBlockParamKey
  = chars:[a-zA-Z0-9_-]+ { return chars.join(''); }

CodeBlockParamValue
  = chars:[^ \t\n]+ { return chars.join(''); }

CodeBlockContent
  = lines:(!"#+END_SRC" line:([^\n]*) Newline { return line.join(''); })*
  {
    return lines.join('\n');
  }

CodeBlockEnd
  = "#+END_SRC" Newline { return true; }

// Basic elements
Whitespace
  = [ \t]*

_ "whitespace"
  = [ \t]*

Newline
  = "\n" / "\r\n"

BlankLine
  = Whitespace Newline 