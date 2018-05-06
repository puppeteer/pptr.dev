class ToolbarComponent extends EventEmitter {
  constructor() {
    super();
    this.element = document.createElement('toolbar-component');
    this.element.innerHTML = `<input type='search' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' placeholder='Start typing to search...'>`;
  }
}
