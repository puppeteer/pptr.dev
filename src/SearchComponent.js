class SearchComponent {
  constructor() {
    this.element = document.createElement('search-component');

    this.input = document.createElement('input');
    this.input.setAttribute('type', 'search');
    this.input.setAttribute('autocomplete', 'off');
    this.input.setAttribute('autocapitalize', 'off');
    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('placeholder', 'Start typing to search...');
    this.input.addEventListener('input', () => {
      this.setVisible(true);
      this.search(this.input.value);
    }, false);

    this._contentElement = document.createElement('search-results');
    this.element.appendChild(this._contentElement);
    this._items = [];
    this._visible = false;
  }

  setItems(items) {
    this._items = items;
  }

  search(query) {
    const results = []
    if (query) {
      const fuzzySearch = new FuzzySearch(query);
      for (const item of this._items) {
        let matches = [];
        let score = fuzzySearch.score(item.text(), matches);
        if (score !== 0) {
          results.push({item, score, matches});
        }
      }
      if (results.length === 0) {
        this._contentElement.innerHTML = 'No results!';
        return;
      }
      results.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff)
          return scoreDiff;
        // Prefer left-most search results.
        const startDiff = a.matches[0] - b.matches[0];
        if (startDiff)
          return startDiff;
        return a.item.text().length - b.item.text().length;
      });
    } else {
      for (const item of this._items)
        results.push({item, score: 0, matches: []});
    }
    this._contentElement.innerHTML = '';
    for (const result of results) {
      const item = document.createElement('search-item');
      const itemIcon = document.createElement('search-item-icon');
      itemIcon.appendChild(result.item.iconElement());
      const itemTitle = document.createElement('search-item-title');
      itemTitle.appendChild(result.item.titleElement(result.matches));
      const itemSubtitle = document.createElement('search-item-subtitle');
      itemSubtitle.appendChild(result.item.subtitleElement());
      item.appendChild(itemIcon);
      item.appendChild(itemTitle);
      item.appendChild(itemSubtitle);
      this._contentElement.appendChild(item);
    }
  }

  setVisible(visible) {
    if (visible === this._visible)
      return;
    this._visible = visible;
    if (visible)
      document.body.appendChild(this.element);
    else
      this.element.remove();
  }
}

class SearchItem {
  text() {}

  iconElement() { }

  titleElement(matches) {}

  subtitleElement() {}
}
