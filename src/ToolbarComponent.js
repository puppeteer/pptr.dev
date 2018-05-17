class ToolbarComponent extends EventEmitter {
  constructor() {
    super();
    this.element = document.createElement('toolbar-component');
    this._left = document.createElement('toolbar-section');
    this._left.classList.add('left');
    this._middle = document.createElement('toolbar-section');
    this._middle.classList.add('middle');
    this._right = document.createElement('toolbar-section');
    this._right.classList.add('right');
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

