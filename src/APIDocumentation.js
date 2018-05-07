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
        const viewId = APIDocumentation._idFromGHAnchor(githubAnchor);
        anchor.setAttribute('href', Router.createRoute(version, viewId));
      } else if (href.startsWith('/') || href.startsWith('../') || href.startsWith('./')) {
        // Link pointing somewhere to PPTR repository.
        const isRelease = /^\d+\.\d+\.\d+$/.test(version);
        const branch = isRelease ? 'v' + version : 'master';
        anchor.setAttribute('href', `https://github.com/GoogleChrome/puppeteer/blob/${branch}/docs/${href}`);
      }
    }

    const classes = [];
    const overview = [];

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
        overview.push(APISection.create(title, content));
    }
    return new APIDocumentation(version, classes, overview);
  }

  static _idFromGHAnchor(githubAnchor) {
    return 'api-' + githubAnchor;
  }

  constructor(version, classes, overview) {
    this.version = version;
    this.classes = classes;
    this.overview = overview;

    this.viewToId = new Map();
    this.idToView = new Map();

    const generateGithubAnchor = (title) => {
      const id = title.trim().toLowerCase().replace(/\s/g, '-').replace(/[^-0-9a-zа-яё]/ig, '');
      let dedupId = id;
      let counter = 0;
      while (this.idToView.has(dedupId))
        dedupId = id + '-' + (++counter);
      return dedupId;
    }

    const assignId = (view, title) => {
      const id = APIDocumentation._idFromGHAnchor(generateGithubAnchor(title));
      this.viewToId.set(view, id);
      this.idToView.set(id, view);
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
  }
}

class APISection {
  static create(title, fragment) {
    const element = document.createElement('api-section');
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
    element.innerHTML = `<h2><api-class-name>class: ${name}</api-class-name></h2>`;
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
    element.innerHTML = [
      `<h3>`,
        `<api-ns-classname>${apiClass.loweredName}</api-ns-classname>`,
        `<api-ns-name>.${name}</api-ns-name>`,
      `</h3>`
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
    element.innerHTML = [
      `<h3>
        <api-method-classname>${apiClass.loweredName}</api-method-classname>`,
        `<api-method-name>.${name}</api-method-name>`,
        `<api-method-args>(${args})</api-method-args>`,
      `</h3>`
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
    element.innerHTML = `<h3><api-event-name>event: '${name}'</api-event-name></h3>`;
    element.appendChild(descFragment);
    return new APIEvent(apiClass, name, element);
  }

  constructor(apiClass, name, element) {
    this.apiClass = apiClass;
    this.name = name;
    this.element = element;
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

