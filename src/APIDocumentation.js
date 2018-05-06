class APIDocumentation {
  static create(apiText) {
    // Parse markdown into HTML
    const reader = new commonmark.Parser();
    const ast = reader.parse(apiText);
    const writer = new commonmark.HtmlRenderer();
    const result = writer.render(ast);
    const domParser = new DOMParser();
    const doc = document.importNode(domParser.parseFromString(result, 'text/html').body, true);

    const classes = [];
    let overview = [];

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
    return new APIDocumentation(classes, overview);
  }

  constructor(classes, overview) {
    this.classes = classes;
    this.overview = overview;
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
        `<api-ns-classname>${apiClass.name.substring(0, 1).toLowerCase() + apiClass.name.substring(1)}</api-ns-classname>`,
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
        <api-method-classname>${apiClass.name.substring(0, 1).toLowerCase() + apiClass.name.substring(1)}</api-method-classname>`,
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
