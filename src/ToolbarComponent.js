class ToolbarComponent extends EventEmitter {
  constructor() {
    super();
    this.element = document.createElement('toolbar-component');
    this.element.innerHTML = `<input type='search' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' placeholder='Start typing to search...'>`;
    this._input = this.element.querySelector('input');
    this._input.addEventListener('input', () => {
      Router.setRoute(Router.createRoute('', '', this._input.value));
    }, false);
  }

  setInputText(text) {
    if (this._input.value !== text) {
      this._input.value = text;
      this._input.focus();
    }
  }
}
