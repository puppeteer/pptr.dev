// Number of search results to render immediately.
const SEARCH_RENDER_COUNT = 50;

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

    this._cancelSearchItem = document.createElement('search-item-custom');
    this._cancelSearchItem.textContent = 'Cancel Search';

    this._showOtherItem = document.createElement('search-item-custom');

    this._selectedElement = null;

    // Activate search on any keypress
    document.addEventListener('keypress', event => {
      if (this.input === document.activeElement)
        return;
      if (/\S/.test(event.key)) {
        if (event.key !== '.')
          this.input.value = '';
        this.input.focus();
      }
    }, false);
    // Activate search on backspace
    document.addEventListener('keydown', event => {
      if (this.input === document.activeElement)
        return;
      if (event.keyCode === 8 || event.keyCode === 46)
        this.input.focus();
    }, false);
    // Activate on paste
    document.addEventListener('paste', event => {
      if (this.input === document.activeElement)
        return;
      this.input.focus();
    }, false);

    document.addEventListener('click', event => {
      if (this.input.contains(event.target))
        return;
      let item = event.target;
      while (item && item.parentElement !== this._contentElement)
        item = item.parentElement;
      if (!item)
        return;
      if (item === this._cancelSearchItem) {
        event.preventDefault();
        this.setVisible(false);
      } else if (item === this._showOtherItem) {
        for (const result of this._remainingResults) {
          const element = this._renderResult(result);
          this._contentElement.appendChild(element);
        }
        this._showOtherItem.remove();
        event.preventDefault();
      } else {
        event.preventDefault();
        this.setVisible(false);
        app.navigateURL(item[SearchComponent._symbol].url());
      }
    }, false);
  }

  setItems(items) {
    this._items = items;
  }

  search(query) {
    const results = []
    this._remainingResults = [];

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
    if (!query)
      this._contentElement.appendChild(this._cancelSearchItem);

    for (let i = 0; i < Math.min(results.length, SEARCH_RENDER_COUNT); ++i) {
      const item = this._renderResult(results[i]);
      this._contentElement.appendChild(item);
    }

    this._remainingResults = results.slice(SEARCH_RENDER_COUNT);
    if (this._remainingResults.length > 0) {
      this._showOtherItem.textContent = `Show Remaining ${this._remainingResults.length} Results.`;
      this._contentElement.appendChild(this._showOtherItem);
    }
  }

  _renderResult(result) {
    const item = document.createElement('search-item');
    const itemIcon = document.createElement('search-item-icon');
    itemIcon.appendChild(result.item.iconElement());
    const itemTitle = document.createElement('search-item-title');
    itemTitle.appendChild(result.item.titleElement(result.matches));
    const itemSubtitle = document.createElement('search-item-subtitle');
    itemSubtitle.appendChild(result.item.subtitleElement());
    item[SearchComponent._symbol] = result.item;
    item.appendChild(itemIcon);
    item.appendChild(itemTitle);
    item.appendChild(itemSubtitle);
    return item;
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

SearchComponent._symbol = Symbol('SearchComponent._symbol');

class SearchItem {
  text() {}

  url() {}

  iconElement() { }

  titleElement(matches) {}

  subtitleElement() {}
}
