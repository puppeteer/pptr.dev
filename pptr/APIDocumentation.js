class APIDocumentation {
  static _markdownToDOM(markdownText) {
    const reader = new commonmark.Parser();
    const ast = reader.parse(markdownText);
    const writer = new commonmark.HtmlRenderer();
    const result = writer.render(ast);
    const domParser = new DOMParser();
    const doc = document.importNode(domParser.parseFromString(result, 'text/html').body, true);

    // Translate all links to api.md to local links.
    for (const a of doc.querySelectorAll('a')) {
      const match = a.href.match(/github.com\/GoogleChrome\/puppeteer\/blob\/(v[^/]+)\/docs\/api.md#(.*)/);
      if (match)
        a.href = app.linkURL('Puppeteer', match[1], APIDocumentation._idFromGHAnchor(match[2]));
      // Mark link as external if necessary
      if (a.hostname !== location.hostname && a.hostname.length) {
        const icon = document.createElement('external-link-icon')
        if (a.children.length === 1 && a.children[0].tagName === 'CODE')
          a.children[0].appendChild(icon);
        else
          a.appendChild(icon);
      }
    }
    // Highlight all code blocks.
    for (const node of doc.querySelectorAll('code.language-javascript')) {
      node.classList.remove('language-javascript');
      node.classList.add('language-js');
    }
    for (const code of doc.querySelectorAll('code.language-js'))
      CodeMirror.runMode(code.textContent, 'text/javascript', code);

    return doc;
  }
  /**
   * @param {string} version
   * @param {string} releaseNotes
   * @param {string} markdownText
   * @param {*} classesLifespan
   */
  static create(version, releaseNotes, markdownText, classesLifespan) {
    // Parse markdown into HTML
    const doc = APIDocumentation._markdownToDOM(markdownText);

    // Translate all relative links to ppdoc links.
    for (const anchor of doc.querySelectorAll('a')) {
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('#')) {
        // Link referencing other part of documentation.
        const githubAnchor = href.substring(1);
        const entryId = APIDocumentation._idFromGHAnchor(githubAnchor);
        anchor.setAttribute('href', app.linkURL('Puppeteer', version, entryId));
      } else if (href.startsWith('/') || href.startsWith('../') || href.startsWith('./')) {
        // Link pointing somewhere to PPTR repository.
        const isRelease = /^\d+\.\d+\.\d+$/.test(version);
        const branch = isRelease ? 'v' + version : 'master';
        anchor.setAttribute('href', `https://github.com/GoogleChrome/puppeteer/blob/${branch}/docs/${href}`);
      }
    }

    const api = new APIDocumentation(version);

    // Add release notes if we have any.
    if (releaseNotes) {
      api.sections.push(APISection.createReleaseNotes(api, APIDocumentation._markdownToDOM(releaseNotes)));
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
    api._initializeContentIds();
    for (const apiClass of api.classes) {
      const classLifespan = classesLifespan.get(apiClass.name);
      apiClass._initializeSinceAndUntilLabels(classLifespan);
      apiClass._initializeTableOfContents();
    }
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

  _initializeContentIds() {
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
    // Version when the APIEntry was first introduced.
    this.sinceVersion = '';
    // Version when the APIEntry was removed.
    this.untilVersion = '';
  }

  linkURL() {
    return app.linkURL('Puppeteer', this.api.version, this.contentId);
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

  static createReleaseNotes(api, descFragment) {
    const element = document.createElement('api-section');
    element.classList.add('api-entry');
    element.innerHTML = `<h1>${api.version} Release Notes</h1>`;
    element.appendChild(descFragment);
    return new APISection(api, 'Release Notes', element);
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
    element.innerHTML = `<h3><pptr-class-icon></pptr-class-icon> <api-class-name>class: ${name}</api-class-name> <pptr-api-since></pptr-api-since></h3>`;
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
    let lowerIndex = 1;
    while (lowerIndex < this.name.length && this.name[lowerIndex + 1] === this.name[lowerIndex + 1].toUpperCase()) ++lowerIndex;
    this.loweredName = name.substring(0, lowerIndex).toLowerCase() + name.substring(lowerIndex);
    this.methods = [];
    this.events = [];
    this.namespaces = [];
  }

  _initializeSinceAndUntilLabels(classLifespan) {
    if (!classLifespan) {
      console.error('Error: missing Class API Lifespan information for class ' + this.name);
      return;
    }
    const sinceElement = this.element.querySelector('pptr-api-since');
    sinceElement.textContent = classLifespan.since;
    this.sinceVersion = classLifespan.since;
    this.untilVersion = classLifespan.until;

    for (const apiEvent of this.events) {
      const sinceElement = apiEvent.element.querySelector('pptr-api-since');
      if (classLifespan.eventsSince.has(apiEvent.name)) {
        apiEvent.sinceVersion = classLifespan.eventsSince.get(apiEvent.name);
        sinceElement.textContent = apiEvent.sinceVersion;
      } else {
        sinceElement.remove();
      }
    }
    for (const apiMethod of this.methods) {
      const sinceElement = apiMethod.element.querySelector('pptr-api-since');
      if (classLifespan.methodsSince.has(apiMethod.name)) {
        apiMethod.sinceVersion = classLifespan.methodsSince.get(apiMethod.name);
        sinceElement.textContent = apiMethod.sinceVersion;
      } else {
        sinceElement.remove();
      }
    }
    for (const apiNamespace of this.namespaces) {
      const sinceElement = apiNamespace.element.querySelector('pptr-api-since');
      if (classLifespan.namespacesSince.has(apiNamespace.name)) {
        apiNamespace.sinceVersion = classLifespan.namespacesSince.get(apiNamespace.name);
        sinceElement.textContent = apiNamespace.sinceVersion;
      } else {
        sinceElement.remove();
      }
    }
  }

  _initializeTableOfContents() {
    const addHeader = (tagName, text) => {
      const header = document.createElement(tagName);
      header.textContent = text;
      this.element.appendChild(header);
    };

    if (this.events.length) {
      addHeader('h4', 'Events');
      const ul = document.createElement('ul');
      ul.classList.add('pptr-table-of-contents');
      for (const apiEvent of this.events)
        createTOC(ul, `${this.loweredName}.on('${apiEvent.name}')`, apiEvent);
      this.element.appendChild(ul);
    }
    if (this.namespaces.length) {
      addHeader('h4', 'Namespaces');
      const ul = document.createElement('ul');
      ul.classList.add('pptr-table-of-contents');
      for (const ns of this.namespaces)
        createTOC(ul, this.loweredName + '.' + ns.name, ns);
      this.element.appendChild(ul);
    }
    if (this.methods.length) {
      addHeader('h4', 'Methods');
      const ul = document.createElement('ul');
      ul.classList.add('pptr-table-of-contents');
      for (const apiMethod of this.methods)
        createTOC(ul, `${this.loweredName}.${apiMethod.name}(${apiMethod.args})`, apiMethod);
      this.element.appendChild(ul);
    }

    function createTOC(ul, text, entity) {
      const li = document.createElement('li');
      li.innerHTML = `<a href=${entity.linkURL()}>${text}</a> `;
      if (entity.sinceVersion) {
        const since = document.createElement('pptr-api-since');
        since.textContent = entity.sinceVersion;
        li.appendChild(since);
      }
      ul.appendChild(li);
    }

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
        `<pptr-api-since></pptr-api-since>`,
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
        `<pptr-api-since></pptr-api-since>`,
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
    element.innerHTML = `<h4><pptr-event-icon></pptr-event-icon> ${apiClass.loweredName}.on(<api-event-name>'${name}'</api-event-name>) <pptr-api-since></pptr-api-since></h4>`;
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

