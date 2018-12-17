const templateCache = new Map();

function template(strings, ...values) {
  let template = templateCache.get(strings);
  if (!template) {
    template = ZTemplate.process(strings);
    templateCache.set(strings, template);
  }
  return new ZTemplate(template, values);
}

export function html(strings, ...values) {
  const node = template(strings, ...values).render();
  if (node.querySelector) {
    node.$ = node.querySelector.bind(node);
    node.$$ = node.querySelectorAll.bind(node);
  }
  return node;
}

const SPACE_REGEX = /^\s+$/;

class ZTemplate {
  static process(strings) {
    const marker = 'z-t-e-m-p-l-a-t-e';
    const markerRegex = /z-t-e-m-p-l-a-t-e/;

    let html = '';
    for (let i = 0; i < strings.length - 1; i++) {
      html += strings[i];
      html += marker;
    }
    html += strings[strings.length - 1];

    const template = document.createElement('template');
    template.innerHTML = html;
    const walker = template.ownerDocument.createTreeWalker(
        template.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
    let valueIndex = 0;
    const emptyTextNodes = [];
    const binds = [];
    const nodesToMark = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.ELEMENT_NODE && markerRegex.test(node.tagName))
        throw new Error('Should not use a parameter as an html tag');

      if (node.nodeType === Node.ELEMENT_NODE && node.hasAttributes()) {
        if (node.hasAttribute('$')) {
          nodesToMark.push(node);
          binds.push({elementId: node.getAttribute('$')});
          node.removeAttribute('$');
        }

        const attributesToRemove = [];
        for (let i = 0; i < node.attributes.length; i++) {
          const name = node.attributes[i].name;

          if (!markerRegex.test(name) &&
              !markerRegex.test(node.attributes[i].value)) {
            continue;
          }

          attributesToRemove.push(name);
          nodesToMark.push(node);
          const bind = {attr: {index: valueIndex}};
          bind.attr.names = name.split(markerRegex);
          valueIndex += bind.attr.names.length - 1;
          bind.attr.values = node.attributes[i].value.split(markerRegex);
          valueIndex += bind.attr.values.length - 1;
          binds.push(bind);
        }
        for (let i = 0; i < attributesToRemove.length; i++)
          node.removeAttribute(attributesToRemove[i]);
      }

      if (node.nodeType === Node.TEXT_NODE && node.data.indexOf(marker) !== -1) {
        const texts = node.data.split(markerRegex);
        node.data = texts[texts.length - 1];
        for (let i = 0; i < texts.length - 1; i++) {
          if (texts[i] && !SPACE_REGEX.test(texts[i]))
            node.parentNode.insertBefore(document.createTextNode(texts[i]), node);
          const nodeToReplace = document.createElement('span');
          nodesToMark.push(nodeToReplace);
          binds.push({replaceNodeIndex: valueIndex++});
          node.parentNode.insertBefore(nodeToReplace, node);
        }
      }

      if (node.nodeType === Node.TEXT_NODE &&
          (!node.previousSibling || node.previousSibling.nodeType === Node.ELEMENT_NODE || isMarkerNode(node.previousSibling)) &&
          (!node.nextSibling || node.nextSibling.nodeType === Node.ELEMENT_NODE || isMarkerNode(node.nextSibling)) && SPACE_REGEX.test(node.data)) {
        emptyTextNodes.push(node);
      }
    }

    for (let i = 0; i < nodesToMark.length; i++)
      nodesToMark[i].classList.add(ZTemplate._class(i));

    for (const emptyTextNode of emptyTextNodes)
      emptyTextNode.remove();
    return {template, binds};

    function isMarkerNode(node) {
      return node.nodeType === Node.TEXT_NODE && node.data.indexOf(marker) !== -1;
    }
  }

  constructor({template, binds}, values) {
    this._template = template;
    this._binds = binds;
    this._values = values;
  }

  render(by$ = {}) {
    let node;
    if (!node) {
      const content = this._template.ownerDocument.importNode(this._template.content, true);
      if (content.firstChild === content.lastChild)
        node = content.firstChild;
      else
        node = content;
//        throw new Error('Root node in template must be one!');

      by$ = {};
      const boundElements = [];
      const boundSet = new Set();
      for (let i = 0; i < this._binds.length; i++) {
        const className = ZTemplate._class(i);
        const element = content.querySelector('.' + className);
        element.classList.remove(className);
        boundElements.push(element);
        if ('replaceNodeIndex' in this._binds[i])
          boundSet.add(element);
      }

      node._nodeBinds = [];
      node._attrBinds = [];

      for (let bindIndex = this._binds.length - 1; bindIndex >= 0; bindIndex--) {
        const bind = this._binds[bindIndex];
        let element = boundElements[bindIndex];
        if ('elementId' in bind) {
          by$[bind.elementId] = by$[bind.elementId] || [];
          by$[bind.elementId].push(element);
        } else if ('replaceNodeIndex' in bind) {
          if (Array.isArray(this._values[bind.replaceNodeIndex])) {
            const span = document.createElement('span');
            element.parentNode.replaceChild(span, element);
            element = span;
          }
          let anchor = element;
          let offset = 0;
          while (anchor && boundSet.has(anchor)) {
            offset++;
            anchor = anchor.previousSibling;
          }
          let nodeBind;
          if (!anchor) {
            nodeBind = {parent: element.parentNode, offset, index: bind.replaceNodeIndex};
          } else {
            nodeBind = {anchor, offset, index: bind.replaceNodeIndex};
          }
          node._nodeBinds.push(nodeBind);
        } else if ('attr' in bind) {
          if (bind.attr.names.length === 2 && !bind.attr.names[0] && !bind.attr.names[1] &&
              bind.attr.values.length === 1 && !bind.attr.values[0] &&
              typeof this._values[bind.attr.index] === 'function') {
            this._values[bind.attr.index].call(null, element);
          } else {
            node._attrBinds.push({element, names: bind.attr.names, values: bind.attr.values, index: bind.attr.index});
          }
        } else {
          throw new Error('Unexpected bind');
        }
      }
    }

    for (const bind of node._nodeBinds) {
      let {anchor, offset} = bind;
      if (bind.parent) {
        anchor = bind.parent.firstChild;
        offset--;
      }
      while (offset-- > 0)
        anchor = anchor.nextSibling;
      this._replaceNode(anchor, this._values[bind.index], by$);
    }

    for (const bind of node._attrBinds) {
      let name = bind.names[0];
      for (let i = 1; i < bind.names.length; i++) {
        name += this._values[bind.index + i - 1];
        name += bind.names[i];
      }
      if (name) {
        let value = bind.values[0];
        for (let i = 1; i < bind.values.length; i++) {
          value += this._values[bind.index + bind.names.length - 1 + i - 1];
          value += bind.values[i];
        }
        bind.element.setAttribute(name, value);
      }
    }

    return node;
  }

  _replaceNode(node, value, by$) {
    if (Array.isArray(value)) {
      let count = node.childNodes.length;
      while (count < value.length) {
        node.appendChild(document.createElement('span'));
        ++count;
      }
      while (count > value.length) {
        node.removeChild(node.lastChild);
        --count;
      }
      let child = node.lastChild;
      for (let i = value.length - 1; i >= 0; i--) {
        const prev = child.previousSibling;
        this._replaceNode(child, value[i], by$);
        child = prev;
      }
      return;
    }

    let replacement = null;
    if (value instanceof Node) {
      replacement = value;
    } else if (value && typeof value === 'object') {
      replacement = value.render(by$);
    } else {
      const s = '' + value;
      if (node.nodeType === Node.TEXT_NODE && node.data === s) {
        return;
      }
      replacement = document.createTextNode('' + value);
    }

    if (node !== replacement && node.parentNode)
      node.parentNode.replaceChild(replacement, node);
    return;
  }
}

// TODO: should we use another technique?
ZTemplate._class = index => 'z-template-class-' + index;
