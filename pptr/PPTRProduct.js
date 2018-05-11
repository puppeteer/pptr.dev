class PPTRProduct extends App.Product {
  static async create() {
    const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text())).map(release => ({
      name: 'pptr-' + release.name,
      version: release.name
    }));
    releases[0].name = 'pptr-stable';
    releases.unshift({name: 'latest', version: 'master'});

    const textPromises = [];
    for (const release of releases) {
      const url = `https://raw.githubusercontent.com/GoogleChrome/puppeteer/${release.version}/docs/api.md`;
      textPromises.push(fetch(url).then(response => response.text()));
    }
    const texts = await Promise.all(textPromises);
    for (let i = 0; i < texts.length; ++i)
      releases[i].text = texts[i];
    return new PPTRProduct(releases);
  }

  constructor(releases) {
    super();
    this._releases = releases;
  }

  defaultVersionName() {
    return 'pptr-stable';
  }

  versionNames() {
    return this._releases.map(release => release.name);
  }

  getVersion(name) {
    const release = this._releases.find(release => release.name === name);
    if (!release)
      return null;
    return new PPTRVersion(release.name, release.text);
  }
}

class PPTRVersion extends App.ProductVersion {
  constructor(name, apiText) {
    super();
    this._name = name;

    this.api = APIDocumentation.create(name, apiText);

    this._sidebarElements = [];
    this._entryToSidebarElement = new Map();
    this._initializeSidebarElements();

    this._searchItems = [];
    for (const apiClass of this.api.classes) {
      {
        const url = app.linkURL(this.api.version, this.api.entryToId(apiClass));
        this._searchItems.push(PPTRSearchItem.createForClass(url, apiClass));
      }
      for (const apiEvent of apiClass.events) {
        const url = app.linkURL(this.api.version, this.api.entryToId(apiEvent));
        this._searchItems.push(PPTRSearchItem.createForEvent(url, apiEvent));
      }
      for (const apiNamespace of apiClass.namespaces) {
        const url = app.linkURL(this.api.version, this.api.entryToId(apiNamespace));
        this._searchItems.push(PPTRSearchItem.createForNamespace(url, apiNamespace));
      }
      for (const apiMethod of apiClass.methods) {
        const url = app.linkURL(this.api.version, this.api.entryToId(apiMethod));
        this._searchItems.push(PPTRSearchItem.createForMethod(url, apiMethod));
      }
    }
  }

  name() {
    return this._name;
  }

  searchItems() {
    return this._searchItems;
  }

  sidebarElements() {
    return this._sidebarElements;
  }

  content(contentId) {
    contentId = contentId || 'api-overview';
    const entry = this.api.idToEntry(contentId);
    if (!entry)
      return null;
    if (entry instanceof APIClass) {
      const element = this._showAPIClass(entry);
      const title = entry.name;
      const selectedSidebarElement = this._entryToSidebarElement.get(entry);
      return {element, title, selectedSidebarElement};
    }
    if (entry instanceof APISection) {
      const element = document.createElement('pptr-api');
      this._renderElements(element, null, [entry.element]);
      const title = entry.name;
      const selectedSidebarElement = this._entryToSidebarElement.get(entry);
      return {element, title, selectedSidebarElement};
    }
    const element = this._showAPIClass(entry.apiClass);
    const scrollAnchor = this._scrollAnchor(entry.element);
    const title = entry.apiClass.loweredName + '.' + entry.name;
    const selectedSidebarElement = this._entryToSidebarElement.get(entry.apiClass);
    return {element, title, selectedSidebarElement, scrollAnchor};
  }

  _initializeSidebarElements() {
    this._sidebarElements = [];
    const resourcesDivider = document.createElement('sidebar-divider');
    resourcesDivider.textContent = 'Resources';
    this._sidebarElements.push(resourcesDivider);
    this._sidebarElements.push(createItem('Slack', 'https://join.slack.com/t/puppeteer/shared_invite/enQtMzU4MjIyMDA5NTM4LTM1OTdkNDhlM2Y4ZGUzZDdjYjM5ZWZlZGFiZjc4MTkyYTVlYzIzYjU5NDIyNzgyMmFiNDFjN2UzNWU0N2ZhZDc'));
    this._sidebarElements.push(createItem('StackOverflow', 'https://stackoverflow.com/questions/tagged/puppeteer'));
    this._sidebarElements.push(createItem('Github', 'https://github.com/GoogleChrome/puppeteer/issues'));
    this._sidebarElements.push(createItem('ToubleShooting', 'https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md'));

    const apiDivider = document.createElement('sidebar-divider');
    apiDivider.innerHTML = `API <span>${this.api.version}</span>`;
    this._sidebarElements.push(apiDivider);
    for (const section of this.api.sections) {
      const route = app.linkURL(this.api.version, this.api.entryToId(section));
      const item = createItem(section.name, route);
      this._sidebarElements.push(item);
      this._entryToSidebarElement.set(section, item);
    }
    for (const apiClass of this.api.classes) {
      const route = app.linkURL(this.api.version, this.api.entryToId(apiClass));
      const item = createItem(apiClass.name, route);
      this._sidebarElements.push(item);
      this._entryToSidebarElement.set(apiClass, item);
    }

    function createItem(text, route) {
      const item = document.createElement('a');
      item.classList.add('sidebar-item');
      item.href = route;
      if (item.hostname !== location.hostname)
        item.innerHTML = `${text}<external-link-icon></external-link-icon>`;
      else
        item.textContent = text;
      return item;
    }
  }

  _showAPIClass(apiClass) {
    const element = document.createElement('pptr-api');

    this._insertBox(element).appendChild(apiClass.element);

    this._renderElements(element, 'Events', apiClass.events.map(e => e.element));
    this._renderElements(element, 'NameSpaces', apiClass.namespaces.map(ns => ns.element));
    this._renderElements(element, 'Methods', apiClass.methods.map(method => method.element));
    return element;
  }

  _scrollAnchor(entryElement) {
    if (entryElement.previousSibling && entryElement.previousSibling.tagName === 'CONTENT-DELIMETER')
      return entryElement.previousSibling;
    let parentBox = entryElement;
    while (parentBox && parentBox.tagName !== 'CONTENT-BOX')
      parentBox = parentBox.parentElement;
    return parentBox;
  }

  _insertBox(container) {
    const box = document.createElement('content-box');
    container.appendChild(box);
    return box;
  }

  _renderElements(container, title, elements) {
    if (!elements.length)
      return;
    if (title) {
      const header = document.createElement('h3');
      header.textContent = title;
      container.appendChild(header);
    }
    const box = this._insertBox(container);
    let lastDelimeter = null;
    for (const element of elements) {
      box.appendChild(element);
      lastDelimeter = document.createElement('content-delimeter');
      box.appendChild(lastDelimeter);
    }
    lastDelimeter.remove();
  }
}

class PPTRSearchItem extends SearchComponent.Item {
  static createForMethod(url, apiMethod) {
    const className = apiMethod.apiClass.loweredName;
    const name = apiMethod.name;
    const args = apiMethod.args;

    const desc = apiMethod.element.querySelector('p');
    const text = `${className}.${name}(${args})`;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className + '.', tagName: 'search-item-api-method-class'},
      {text: `${name}(${args})`, tagName: 'search-item-api-method-name'},
    ]);
    return new PPTRSearchItem(url, text, 'pptr-method-icon', titleRenderer, desc ? desc.textContent : '');
  }

  static createForEvent(url, apiEvent) {
    const className = apiEvent.apiClass.loweredName;
    const name = apiEvent.name;

    const desc = apiEvent.element.querySelector('p');
    const text = `${className}.on('${name}')`;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className + '.on(', tagName: 'search-item-api-method-class'},
      {text: `'${name}'`, tagName: 'search-item-api-method-name'},
      {text: ')', tagName: 'search-item-api-method-class'},
    ]);
    return new PPTRSearchItem(url, text, 'pptr-event-icon', titleRenderer, desc ? desc.textContent : '');
  }

  static createForNamespace(url, apiNamespace) {
    const className = apiNamespace.apiClass.loweredName;
    const name = apiNamespace.name;

    const desc = apiNamespace.element.querySelector('p');
    const text = `${className}.${name}`;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className + '.', tagName: 'search-item-api-method-class'},
      {text: name, tagName: 'search-item-api-method-name'},
    ]);
    return new PPTRSearchItem(url, text, 'pptr-ns-icon', titleRenderer, desc ? desc.textContent : '');
  }

  static createForClass(url, apiClass) {
    const className = apiClass.name;

    const desc = apiClass.element.querySelector('p');
    const text = className;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className, tagName: 'search-item-api-method-name'},
    ]);
    return new PPTRSearchItem(url, text, 'pptr-class-icon', titleRenderer, desc ? desc.textContent : '');
  }

  constructor(url, text, iconTagName, titleRenderer, description) {
    super();
    this._url = url;
    this._text = text;
    this._iconTagName = iconTagName;
    this._titleRenderer = titleRenderer;
    this._description = description;

    this._subtitleElement = null;
    this._iconElement = null;
  }

  url() {
    return this._url;
  }

  text() {
    return this._text;
  }

  titleElement(matches) {
    return this._titleRenderer.call(null, matches);
  }

  iconElement() {
    if (!this._iconElement)
      this._iconElement = document.createElement(this._iconTagName);
    return this._iconElement;
  }

  subtitleElement() {
    if (!this._subtitleElement) {
      this._subtitleElement = document.createElement('div');
      this._subtitleElement.textContent = this._description;
    }
    return this._subtitleElement;
  }
}

/**
 * @param {string} text
 * @param {!Array<number>} matches
 * @param {number} fromIndex
 * @param {number} fromIndex
 * @return {!Element}
 */
function renderTokensWithMatches(matches, tokens) {
  if (!matches.length) {
    const fragment = document.createDocumentFragment();
    for (let token of tokens) {
      if (token.tagName) {
        const node = document.createElement(token.tagName);
        node.textContent = token.text;
        fragment.appendChild(node);
      } else {
        fragment.appendChild(document.createTextNode(token.text));
      }
    }
    return fragment;
  }

  const fragment = document.createDocumentFragment();
  let offset = 0;
  let matchesSet = new Set(matches);
  for (let token of tokens) {
    const result = token.tagName ? document.createElement(token.tagName) : document.createDocumentFragment();
    let from = 0;
    let lastInsideHighlight = false;
    for (let to = 0; to <= token.text.length; ++to) {
      const insideHighlight = matchesSet.has(to + offset);
      if (insideHighlight === lastInsideHighlight && to < token.text.length)
        continue;
      if (from < to) {
        if (lastInsideHighlight) {
          const node = document.createElement('search-highlight');
          node.textContent = token.text.substring(from, to);
          result.appendChild(node);
        } else {
          const node = document.createTextNode(token.text.substring(from, to));
          result.appendChild(node);
        }
        from = to;
      }
      lastInsideHighlight = insideHighlight;
    }
    offset += token.text.length;
    fragment.appendChild(result);
  }
  return fragment;
}

