/**
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const MAGIC_STUB_COMMENT = '## MAGIC_STUB_COMMENT ##';

export function html(strings, ...values) {
  let html = '';
  const nodes = [];
  for (let i = 0; i < strings.length - 1; ++i) {
    html += strings[i];
    const node = asNode(values[i]);
    if (node) {
      nodes.push(node);
      html += `<!--${MAGIC_STUB_COMMENT}-->`;
    } else {
      html += values[i];
    }
  }
  html += strings[strings.length - 1];

  const template = document.createElement('template');
  template.innerHTML = html;
  // Cleanup empty text nodes.
  const textWalker = template.ownerDocument.createTreeWalker(template.content, NodeFilter.SHOW_TEXT, null, false);
  const emptyNodes = [];
  while (textWalker.nextNode()) {
    const node = textWalker.currentNode;
    if ((!node.previousSibling || node.previousSibling.nodeType === Node.ELEMENT_NODE)
        && (!node.nextSibling || node.nextSibling.nodeType === Node.ELEMENT_NODE)
        && /^\s*$/.test(node.data))
      emptyNodes.push(node);
  }
  for (const node of emptyNodes)
    node.remove();
  const singleChild = template.content.firstChild === template.content.lastChild;
  const dom = document.importNode(singleChild ? template.content.firstChild : template.content, true);

  // Iterate comments to replace them with values.
  const walker = document.createTreeWalker(dom, NodeFilter.SHOW_COMMENT, null, false);
  let nodeIndex = 0;
  let stubComments = new Map();
  while (walker.nextNode()) {
    const comment = walker.currentNode;
    if (comment.data === MAGIC_STUB_COMMENT)
      stubComments.set(comment, nodes[nodeIndex++]);
  }
  for (let [stubComment, node] of stubComments)
    stubComment.replaceWith(node);
  return dom;

  function asNode(value) {
    if (value instanceof Node)
      return value;
    if (Array.isArray(value)) {
      const fragment = document.createDocumentFragment();
      for (const v of value) {
        const node = asNode(v);
        if (!node)
          return null;
        fragment.appendChild(node);
      }
      return fragment;
    }
    return null;
  }
}
