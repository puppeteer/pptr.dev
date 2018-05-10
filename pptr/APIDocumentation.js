class APIDocumentation {
  /**
   * @param {string} version
   * @param {string} markdownText
   */
  static create(version, markdownText) {
    // Parse markdown into HTML
    const reader = new commonmark.Parser();
    const ast = reader.parse(markdownText);
    const writer = new commonmark.HtmlRenderer();
    const result = writer.render(ast);
    const domParser = new DOMParser();
    const doc = document.importNode(domParser.parseFromString(result, 'text/html').body, true);

    // Translate all relative links to ppdoc links.
    for (const anchor of doc.querySelectorAll('a')) {
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('#')) {
        // Link referencing other part of documentation.
        const githubAnchor = href.substring(1);
        const entryId = APIDocumentation._idFromGHAnchor(githubAnchor);
        anchor.setAttribute('href', app.linkURL(version, entryId));
      } else if (href.startsWith('/') || href.startsWith('../') || href.startsWith('./')) {
        // Link pointing somewhere to PPTR repository.
        const isRelease = /^\d+\.\d+\.\d+$/.test(version);
        const branch = isRelease ? 'v' + version : 'master';
        anchor.setAttribute('href', `https://github.com/GoogleChrome/puppeteer/blob/${branch}/docs/${href}`);
      }
      // Mark link as external if necessary
      if (anchor.hostname !== location.hostname && anchor.hostname.length)
        anchor.appendChild(document.createElement('external-link-icon'));
    }

    // Highlight all code blocks.
    for (const code of doc.querySelectorAll('code.language-js'))
      CodeMirror.runMode(code.textContent, 'text/javascript', code);

    const classes = [];
    const sections = [];

    // All class headers are rendered as H3 tags
    const headers = doc.querySelectorAll('h3');
    for (let i = 0; i < headers.length; ++i) {
      const header = headers[i];
      const nextHeader = i + 1 < headers.length ? headers[i + 1] : null;
      const title = header.textContent;
      // Import all HTML from section until we hit next top-level header.
      const content = extractSiblingsIntoFragment(header.nextSibling, nextHeader);
      if (title.toLowerCase().startsWith('class:'))
        classes.push(APIClass.create(title, content));
      else
        sections.push(APISection.create(title, content));
    }
    return new APIDocumentation(version, classes, sections);
  }

  static _idFromGHAnchor(githubAnchor) {
    return 'api-' + githubAnchor;
  }

  constructor(version, classes, sections) {
    this.version = version;
    this.classes = classes;
    this.sections = sections;

    this._entryToId = new Map();
    this._idToEntry = new Map();

    const generateGithubAnchor = (title) => {
      const id = title.trim().toLowerCase().replace(/\s/g, '-').replace(/[^-0-9a-zа-яё]/ig, '');
      let dedupId = id;
      let counter = 0;
      while (this._idToEntry.has(dedupId))
        dedupId = id + '-' + (++counter);
      return dedupId;
    }

    const assignId = (entry, title) => {
      const id = APIDocumentation._idFromGHAnchor(generateGithubAnchor(title));
      this._entryToId.set(entry, id);
      this._idToEntry.set(id, entry);
    };

    for (const apiClass of classes) {
      assignId(apiClass, `class: '${apiClass.name}'`);
      for (const apiEvent of apiClass.events)
        assignId(apiEvent, `event: '${apiEvent.name}'`);
      for (const apiMethod of apiClass.methods)
        assignId(apiMethod, `${apiClass.loweredName}.${apiMethod.name}(${apiMethod.args})`);
      for (const ns of apiClass.namespaces)
        assignId(ns, `${apiClass.loweredName}.${ns.name}`);
    }
    for (const section of sections) {
      assignId(section, section.title);
    }
  }

  entryToId(entry) {
    return this._entryToId.get(entry) || null;
  }

  idToEntry(id) {
    return this._idToEntry.get(id) || null;
  }
}

class APISection {
  static create(title, fragment) {
    const element = document.createElement('api-section');
    element.classList.add('api-entry');
    element.innerHTML = `<h1>${title}</h1>`;
    element.appendChild(fragment);
    return new APISection(title, element);
  }

  constructor(title, element) {
    this.title = title;
    this.element = element;
  }
}

class APIClass {
  static create(title, fragment) {
    const name = title.replace(/^class:/i, '').trim();
    const headers = fragment.querySelectorAll('h4');
    const element = document.createElement('api-class');
    element.classList.add('api-entry');
    element.innerHTML = `<h3><api-class-name>class: ${name}</api-class-name></h3>`;
    element.appendChild(extractSiblingsIntoFragment(fragment.firstChild, headers[0]));
    const apiClass = new APIClass(name, element);

    for (let i = 0; i < headers.length; ++i) {
      const header = headers[i];
      const nextHeader = i + 1 < headers.length ? headers[i + 1] : null;
      const title = header.textContent;
      const fragment = extractSiblingsIntoFragment(header.nextSibling, nextHeader);
      if (title.toLowerCase().startsWith('event:'))
        apiClass.events.push(APIEvent.create(apiClass, title, fragment));
      else if (title.includes('('))
        apiClass.methods.push(APIMethod.create(apiClass, title, fragment));
      else
        apiClass.namespaces.push(APINamespace.create(apiClass, title, fragment));
    }
    return apiClass;
  }

  constructor(name, element) {
    this.name = name;
    this.loweredName = name.substring(0, 1).toLowerCase() + name.substring(1);
    this.element = element;
    this.methods = [];
    this.events = [];
    this.namespaces = [];
  }
}

class APINamespace {
  static create(apiClass, title, fragment) {
    const name = title.split('.').pop();
    const element = document.createElement('api-ns');
    element.classList.add('api-entry');
    element.innerHTML = [
      `<h4>`,
        `<api-ns-classname>${apiClass.loweredName}</api-ns-classname>`,
        `<api-ns-name>.${name}</api-ns-name>`,
      `</h4>`
    ].join('');
    return new APINamespace(apiClass, name, element);
  }

  constructor(apiClass, name, element) {
    this.apiClass = apiClass;
    this.name = name;
    this.element = element;
  }
}

class APIMethod {
  static create(apiClass, title, descFragment) {
    const name = title.match(/\.([^(]*)/)[1];
    const args = title.match(/\((.*)\)/)[1];
    const element = document.createElement('api-method');
    element.classList.add('api-entry');
    element.innerHTML = [
      `<h4>
        <api-method-classname>${apiClass.loweredName}</api-method-classname>`,
        `<api-method-name>.${name}</api-method-name>`,
        `<api-method-args>(${args})</api-method-args>`,
      `</h4>`
    ].join('');
    element.appendChild(descFragment);
    return new APIMethod(apiClass, name, args, element);
  }

  constructor(apiClass, name, args, element) {
    this.apiClass = apiClass;
    this.name = name;
    this.args = args;
    this.element = element;
  }
}

class APIEvent {
  static create(apiClass, title, descFragment) {
    const name = title.match(/'(.*)'/)[1];
    const element = document.createElement('api-event');
    element.classList.add('api-entry');
    element.innerHTML = `<h4>event: <api-event-name>'${name}'</api-event-name></h4>`;
    element.appendChild(descFragment);
    return new APIEvent(apiClass, name, element);
  }

  constructor(apiClass, name, element) {
    this.apiClass = apiClass;
    this.name = name;
    this.element = element;
  }
}

class APIMethodSearchItem {
  constructor(apiMethod) {
    this._className = apiMethod.apiClass.loweredName;
    this._name = apiMethod.name;
    this._args = apiMethod.args;

    const desc = apiMethod.element.querySelector('p');
    this._description = desc ? desc.textContent : '';

    this._subtitleElement = null;
    this._iconElement = null;

    this._text = `${this._className}.${this._name}(${this._args})`;
  }

  text() {
    return this._text;
  }

  titleElement(matches) {
    const result = document.createDocumentFragment();

    let index = 0;
    const render = (token, tagName) => {
      const tag = tagName ? document.createElement(tagName) : document.createDocumentFragment();
      tag.appendChild(renderTextWithMatches(this._text, matches, index, index + token.length));
      index += token.length;
      result.appendChild(tag);
    };

    render(this._className + '.', 'search-item-api-method-class');
    render(`${this._name}(${this._args})`, 'search-item-api-method-name');
    return result;
  }

  iconElement() {
    if (!this._iconElement) {
      this._iconElement = document.createElement('method-icon');
    }
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

class PPTRProvider {
  static async create(name) {
    const apiText = await fetch('./api.md').then(response => response.text());
    return new PPTRProvider(name, apiText);
  }

  constructor(name, apiText) {
    this.api = APIDocumentation.create(name, apiText);

    this._sidebarElements = [];
    this._entryToSidebarElement = new Map();
    this._initializeSidebarElements();

    this._searchItems = [];
    for (const apiClass of this.api.classes) {
      for (const apiMethod of apiClass.methods)
        this._searchItems.push(new APIMethodSearchItem(apiMethod));
    }
  }

  searchItems() {
    return this._searchItems;
  }

  sidebarElements() {
    return this._sidebarElements;
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
      const item = createItem(section.title, route);
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

  defaultContentId() {
    return 'api-overview';
  }

  getContent(contentId) {
    const entry = this.api.idToEntry(contentId);
    if (!entry)
      return null;

    if (entry instanceof APIClass)
      return {element: this._showAPIClass(entry)};
    if (entry instanceof APISection) {
      const fragment = document.createDocumentFragment();
      this._renderElements(fragment, null, [entry.element]);
      return {element: fragment};
    }
    const element = this._showAPIClass(entry.apiClass);
    const scrollAnchor = this._scrollAnchor(entry.element);
    return {element, scrollAnchor};
  }

  getSelectedSidebarElement(contentId) {
    const entry = this.api.idToEntry(contentId);
    if ((entry instanceof APISection) || (entry instanceof APIClass))
      return this._entryToSidebarElement.get(entry);
    return this._entryToSidebarElement.get(entry.apiClass);
  }

  _showAPIClass(apiClass) {
    const fragment = document.createDocumentFragment();

    this._insertBox(fragment).appendChild(apiClass.element);

    this._renderElements(fragment, 'Events', apiClass.events.map(e => e.element));
    this._renderElements(fragment, 'NameSpaces', apiClass.namespaces.map(ns => ns.element));
    this._renderElements(fragment, 'Methods', apiClass.methods.map(method => method.element));
    return fragment;
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

/**
 * @param {!Node} fromInclusive
 * @param {!Node} toExclusive
 * @return {!DocumentFragment}
 */
function extractSiblingsIntoFragment(fromInclusive, toExclusive) {
  const fragment = document.createDocumentFragment();
  let node = fromInclusive;
  while (node && node !== toExclusive) {
    const next = node.nextSibling;
    fragment.appendChild(node);
    node = next;
  }
  return fragment;
}

/**
 * @param {string} text
 * @param {!Array<number>} matches
 * @param {number} fromIndex
 * @param {number} fromIndex
 * @return {!Element}
 */
function renderTextWithMatches(text, matches, fromIndex, toIndex) {
  if (!matches.length)
    return document.createTextNode(text.substring(fromIndex, toIndex));
  let result = document.createDocumentFragment();
  let insideMatch = false;
  let currentIndex = fromIndex;
  let matchIndex = new Set(matches);
  for (let i = fromIndex; i < toIndex; ++i) {
    if (insideMatch !== matchIndex.has(i)) {
      add(currentIndex, i, insideMatch);
      insideMatch = matchIndex.has(i);
      currentIndex = i;
    }
  }
  add(currentIndex, toIndex, insideMatch);
  return result;

  /**
   * @param {number} from
   * @param {number} to
   * @param {boolean} isHighlight
   */
  function add(from, to, isHighlight) {
    if (to === from)
      return;
    let node = null;
    if (isHighlight) {
      node = document.createElement('search-highlight');
      node.textContent = text.substring(from, to);
    } else {
      node = document.createTextNode(text.substring(from, to));
    }
    result.appendChild(node);
  }
}
