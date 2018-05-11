class APIDocumentation {
  static _markdownToDOM(markdownText) {
    const reader = new commonmark.Parser();
    const ast = reader.parse(markdownText);
    const writer = new commonmark.HtmlRenderer();
    const result = writer.render(ast);
    const domParser = new DOMParser();
    return document.importNode(domParser.parseFromString(result, 'text/html').body, true);
  }
  /**
   * @param {string} version
   * @param {string} releaseNotes
   * @param {string} markdownText
   */
  static create(version, releaseNotes, markdownText) {
    // Parse markdown into HTML
    const doc = APIDocumentation._markdownToDOM(markdownText);

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

    const api = new APIDocumentation(version);

    // Add release notes if we have any.
    if (releaseNotes) {
      api.sections.push(APISection.create(api, 'Release Notes', APIDocumentation._markdownToDOM(releaseNotes)));
    }

    // All class headers are rendered as H3 tags
    const headers = doc.querySelectorAll('h3');
    for (let i = 0; i < headers.length; ++i) {
      const header = headers[i];
      const nextHeader = i + 1 < headers.length ? headers[i + 1] : null;
      const title = header.textContent;
      // Import all HTML from section until we hit next top-level header.
      const content = extractSiblingsIntoFragment(header.nextSibling, nextHeader);
      if (title.toLowerCase().startsWith('class:'))
        api.classes.push(APIClass.create(api, title, content));
      else
        api.sections.push(APISection.create(api, title, content));
    }
    api._initialize();
    return api;
  }

  static _idFromGHAnchor(githubAnchor) {
    return 'api-' + githubAnchor;
  }

  constructor(version) {
    this.version = version;
    this.sections = [];
    this.classes = [];

    this._defaultContentId = null;
    this._idToEntry = new Map();
  }

  defaultContentId() {
    return this._defaultContentId;
  }

  _initialize() {
    const generateGithubAnchor = (title) => {
      const id = title.trim().toLowerCase().replace(/\s/g, '-').replace(/[^-0-9a-zа-яё]/ig, '');
      let dedupId = id;
      let counter = 0;
      while (this._idToEntry.has(dedupId))
        dedupId = id + '-' + (++counter);
      return dedupId;
    }

    const assignId = (entry, title) => {
      const contentId = APIDocumentation._idFromGHAnchor(generateGithubAnchor(title));
      entry.contentId = contentId;
      this._idToEntry.set(contentId, entry);
    };

    for (const section of this.sections)
      assignId(section, section.name);
    for (const apiClass of this.classes) {
      assignId(apiClass, `class: '${apiClass.name}'`);
      for (const apiEvent of apiClass.events)
        assignId(apiEvent, `event: '${apiEvent.name}'`);
      for (const apiMethod of apiClass.methods)
        assignId(apiMethod, `${apiClass.loweredName}.${apiMethod.name}(${apiMethod.args})`);
      for (const ns of apiClass.namespaces)
        assignId(ns, `${apiClass.loweredName}.${ns.name}`);
    }

    this._defaultContentId = this._idToEntry.keys().next().value;
  }

  idToEntry(id) {
    return this._idToEntry.get(id) || null;
  }
}

class APIEntry {
  constructor(api, name, element, contentId) {
    this.api = api;
    this.name = name;
    this.element = element;
    // This has to be assigned later.
    this.contentId = null;
  }

  linkURL() {
    return app.linkURL(this.api.version, this.contentId);
  }
}

class APISection extends APIEntry {
  static create(api, title, descFragment) {
    const element = document.createElement('api-section');
    element.classList.add('api-entry');
    element.innerHTML = `<h1>${title}</h1>`;
    element.appendChild(descFragment);
    return new APISection(api, title, element);
  }

  constructor(api, name, element) {
    super(api, name, element);
  }
}

class APIClass extends APIEntry {
  static create(api, title, fragment) {
    const name = title.replace(/^class:/i, '').trim();
    const headers = fragment.querySelectorAll('h4');

    const element = document.createElement('api-class');
    element.classList.add('api-entry');
    element.innerHTML = `<h3><pptr-class-icon></pptr-class-icon><api-class-name>class: ${name}</api-class-name></h3>`;
    element.appendChild(extractSiblingsIntoFragment(fragment.firstChild, headers[0]));
    const apiClass = new APIClass(api, name, element);

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

  constructor(api, name, element) {
    super(api, name, element);
    this.loweredName = name.substring(0, 1).toLowerCase() + name.substring(1);
    this.methods = [];
    this.events = [];
    this.namespaces = [];
  }
}

class APINamespace extends APIEntry {
  static create(apiClass, title, fragment) {
    const name = title.split('.').pop();
    const element = document.createElement('api-ns');
    element.classList.add('api-entry');
    element.innerHTML = [
      `<h4>`,
        '<pptr-ns-icon></pptr-ns-icon>',
        `<api-ns-classname>${apiClass.loweredName}</api-ns-classname>`,
        `<api-ns-name>.${name}</api-ns-name>`,
      `</h4>`
    ].join('');
    element.appendChild(fragment);
    return new APINamespace(apiClass, name, element);
  }

  constructor(apiClass, name, element) {
    super(apiClass.api, name, element);
    this.apiClass = apiClass;
  }
}

class APIMethod extends APIEntry {
  static create(apiClass, title, descFragment) {
    const name = title.match(/\.([^(]*)/)[1];
    const args = title.match(/\((.*)\)/)[1];
    const element = document.createElement('api-method');
    element.classList.add('api-entry');
    element.innerHTML = [
      `<h4>
        <pptr-method-icon></pptr-method-icon>
        <api-method-classname>${apiClass.loweredName}</api-method-classname>`,
        `<api-method-name>.${name}</api-method-name>`,
        `<api-method-args>(${args})</api-method-args>`,
      `</h4>`
    ].join('');
    element.appendChild(descFragment);
    return new APIMethod(apiClass, name, args, element);
  }

  constructor(apiClass, name, args, element) {
    super(apiClass.api, name, element);
    this.apiClass = apiClass;
    this.args = args;
  }
}

class APIEvent extends APIEntry {
  static create(apiClass, title, descFragment) {
    const name = title.match(/'(.*)'/)[1];
    const element = document.createElement('api-event');
    element.classList.add('api-entry');
    element.innerHTML = `<h4><pptr-event-icon></pptr-event-icon>${apiClass.loweredName}.on(<api-event-name>'${name}'</api-event-name>)</h4>`;
    element.appendChild(descFragment);
    return new APIEvent(apiClass, name, element);
  }

  constructor(apiClass, name, element) {
    super(apiClass.api, name, element);
    this.apiClass = apiClass;
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

