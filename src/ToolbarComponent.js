class ToolbarComponent extends EventEmitter {
  constructor() {
    super();
    this.element = document.createElement('toolbar-component');
    this._left = document.createElement('toolbar-section');
    this._middle = document.createElement('toolbar-section');
    this._right = document.createElement('toolbar-section');
    this.element.appendChild(this._left);
    this.element.appendChild(this._middle);
    this.element.appendChild(this._right);
  }

  left() {
    return this._left;
  }

  middle() {
    return this._middle;
  }

  right() {
    return this._right;
  }
}

