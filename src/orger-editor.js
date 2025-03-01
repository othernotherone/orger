/**
 * OrgerEditor - A web component for editing Org Mode documents
 * 
 * This is a simple demonstration of how Orger could be used in a web application.
 * In a real implementation, it would use the actual @orger/core package.
 */
class OrgerEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Create the editor elements
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 300px;
          font-family: monospace;
        }
        
        .container {
          display: flex;
          width: 100%;
          height: 100%;
          border: 1px solid #ccc;
        }
        
        .editor {
          flex: 1;
          padding: 10px;
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          border: none;
          outline: none;
          white-space: pre-wrap;
        }
        
        .preview {
          flex: 1;
          padding: 10px;
          overflow: auto;
          border-left: 1px solid #ccc;
        }
        
        .preview h1, .preview h2, .preview h3, .preview h4, .preview h5, .preview h6 {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .preview p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .preview ul, .preview ol {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          padding-left: 2em;
        }
        
        .preview pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 3px;
          overflow: auto;
        }
        
        .preview code {
          font-family: monospace;
        }
        
        .preview table {
          border-collapse: collapse;
          margin: 1em 0;
        }
        
        .preview th, .preview td {
          border: 1px solid #ccc;
          padding: 5px;
        }
        
        .preview th {
          background-color: #f5f5f5;
        }
        
        .org-todo-active {
          color: #d9534f;
          font-weight: bold;
        }
        
        .org-todo-done {
          color: #5cb85c;
          font-weight: bold;
        }
        
        .org-tag {
          background-color: #f5f5f5;
          border-radius: 3px;
          padding: 0 5px;
          margin-left: 5px;
          font-size: 0.8em;
        }
      </style>
      
      <div class="container">
        <textarea class="editor" spellcheck="false"></textarea>
        <div class="preview"></div>
      </div>
    `;
    
    // Get references to the editor and preview elements
    this.editor = this.shadowRoot.querySelector('.editor');
    this.preview = this.shadowRoot.querySelector('.preview');
    
    // Bind event handlers
    this.handleInput = this.handleInput.bind(this);
    
    // Add event listeners
    this.editor.addEventListener('input', this.handleInput);
  }
  
  /**
   * Called when the element is connected to the DOM
   */
  connectedCallback() {
    // Set initial content if provided
    if (this.hasAttribute('content')) {
      this.editor.value = this.getAttribute('content');
      this.updatePreview();
    }
  }
  
  /**
   * Called when the element is disconnected from the DOM
   */
  disconnectedCallback() {
    // Remove event listeners
    this.editor.removeEventListener('input', this.handleInput);
  }
  
  /**
   * Called when an attribute is changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'content' && oldValue !== newValue) {
      this.editor.value = newValue;
      this.updatePreview();
    }
  }
  
  /**
   * Define which attributes to observe
   */
  static get observedAttributes() {
    return ['content'];
  }
  
  /**
   * Handle input events
   */
  handleInput() {
    this.updatePreview();
    
    // Dispatch a change event
    this.dispatchEvent(new CustomEvent('orger-change', {
      detail: {
        content: this.editor.value
      }
    }));
  }
  
  /**
   * Update the preview
   */
  updatePreview() {
    // In a real implementation, this would use the @orger/core package
    // For now, we'll just do a simple conversion
    const content = this.editor.value;
    let html = '';
    
    // Simple conversion of headings
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('* ')) {
        const text = line.substring(2);
        html += `<h1>${text}</h1>`;
      } else if (line.startsWith('** ')) {
        const text = line.substring(3);
        html += `<h2>${text}</h2>`;
      } else if (line.startsWith('*** ')) {
        const text = line.substring(4);
        html += `<h3>${text}</h3>`;
      } else if (line.startsWith('- ')) {
        const text = line.substring(2);
        html += `<ul><li>${text}</li></ul>`;
      } else if (line.trim() === '') {
        html += '<br>';
      } else {
        html += `<p>${line}</p>`;
      }
    }
    
    this.preview.innerHTML = html;
  }
  
  /**
   * Get the content
   */
  get content() {
    return this.editor.value;
  }
  
  /**
   * Set the content
   */
  set content(value) {
    this.editor.value = value;
    this.updatePreview();
  }
}

// Register the custom element
customElements.define('orger-editor', OrgerEditor); 