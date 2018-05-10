class ContentComponent {
  constructor() {
    this.element = document.createElement('content-component');
    this.element.tabIndex = 0;
  }

  show(contentElement, scrollAnchor) {
    this.element.innerHTML = '';
    this.element.scrollTop = 0;
    this.element.appendChild(contentElement);
    if (scrollAnchor)
      scrollAnchor.scrollIntoView();
  }
}
