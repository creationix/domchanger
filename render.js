"use strict";
module.exports = render;

function render(tree) {

  // Render strings as text nodes
  if (typeof tree === 'string') return document.createTextNode(tree);

  // Pass through html elements and text nodes as-is
  if (tree instanceof HTMLElement || tree instanceof window.Text) return tree;

  // Stringify any other non-array types
  if (!Array.isArray(tree)) return document.createTextNode(tree + "");

  // Empty arrays are just empty fragments.
  if (!tree.length) return document.createDocumentFragment();

  var node, first;
  for (var i = 0, l = tree.length; i < l; i++) {
    var part = tree[i];

    if (!node) {
      if (typeof part === 'string') {
        // Create a new dom node by parsing the tagline
        var tag = part.match(TAG_MATCH);
        tag = tag ? tag[0] : "div";
        node = document.createElement(tag);
        first = true;
        var classes = part.match(CLASS_MATCH);
        if (classes) node.setAttribute('class', classes.map(stripFirst).join(' '));
        var id = part.match(ID_MATCH);
        if (id) node.setAttribute('id', id[0].substr(1));
        continue;
      } else if (typeof part === 'function') {
        return render(part.call(tree[++i]));
      }
      else {
        node = document.createDocumentFragment();
      }
    }

    // Except the first item if it's an attribute object
    if (first && typeof part === 'object' && part.constructor === Object) {
      setAttrs(node, part);
    } else {
      node.appendChild(render(part));
    }
    first = false;
  }
  return node;
}

function setAttrs(node, attrs) {
  var keys = Object.keys(attrs);
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    var value = attrs[key];
    if (key === "style" && value.constructor === Object) {
      setStyle(node.style, value);
    } else if (key.substr(0, 2) === "on") {
      node.addEventListener(key.substr(2), value, false);
    } else if (typeof value === "boolean") {
      if (value) node.setAttribute(key, key);
    } else {
      node.setAttribute(key, value);
    }
  }
}

function setStyle(style, attrs) {
  var keys = Object.keys(attrs);
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    style[key] = attrs[key];
  }
}

var CLASS_MATCH = /\.[^.#$]+/g,
    ID_MATCH = /#[^.#$]+/,
    TAG_MATCH = /^[^.#$]+/;

function stripFirst(part) {
  return part.substr(1);
}
