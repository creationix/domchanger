"use strict";
module.exports = create;

function create(tree) {
  if (!tree) return;
  console.log(tree)
  if (typeof tree === "string") {
    return { text: tree};
  }

  if (!Array.isArray(tree)) throw new TypeError("Tree must be array");
  if (!tree.length) return;
  var first = tree[0];
  var component;
  if (typeof first === "function") {
    component = first;
  }
  else if (typeof first === "string") {
    var i = 1;
    var tag = { tag: first };
    if (tree[i] && tree[i].constructor === Object) {
      tag.props = tree[i];
      i++;
    }
    tag.children = tree.slice(i).map(create).filter(Boolean);
    return tag;
  }
  else if (Array.isArray(first)) {
    throw "recurse?"
  }
  else if (first.constructor === Object) {
    throw "named children?";
  }
  else {
    throw new TypeError("First item must be string or function");
  }
  var refs = {};
  var functions = component(emit, refresh, refs);
  var body = create(functions.render.apply(null, tree.slice(1)));

  return {
    component: component,
    refs: refs,
    functions: functions,
    body: body
  };

  function emit(name) {

  }
  function refresh() {

  }


}

function renderer(tree) {

  // Render strings as text nodes
  if (typeof tree === 'string') return document.createTextNode(tree);

  // Pass through html elements and text nodes as-is
  if (tree instanceof HTMLElement || tree instanceof window.Text) return tree;

  // Stringify any other non-array types
  if (!Array.isArray(tree)) return document.createTextNode(tree + "");

  // Empty arrays are just empty fragments.
  if (!tree.length) return document.createDocumentFragment();

  var first = tree[0];
  if (typeof first === "string") {

  }
  if (typeof tree)
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
        return renderer(part.apply(null, tree.slice(i + 1)));
      }
      else {
        node = document.createDocumentFragment();
      }
    }

    // Except the first item if it's an attribute object
    if (first && typeof part === 'object' && part.constructor === Object) {
      setAttrs(node, part);
    } else {
      node.appendChild(renderer(part));
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

function stripFirst(part) {
  return part.substr(1);
}

/////////////

var FilterableProductTable = require('./filterable-product-table');
var PRODUCTS = require('./products');

var parent = create([FilterableProductTable, PRODUCTS]);
console.log("parent", parent);
