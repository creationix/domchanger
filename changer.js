"use strict";
module.exports = create;

var CLASS_MATCH = /\.[^.#$]+/g,
    ID_MATCH = /#[^.#$]+/,
    REF_MATCH = /\$[^.#$]+/,
    TAG_MATCH = /^[^.#$]+/;

var slice = [].slice;
function noop() {}

function createComponent(component, parent, owner) {
  var refs = {};
  var data = [];
  console.log("new " + component.name);
  var out = component(emit, refresh, refs);
  var render = out.render;
  var on = out.on || {};
  var cleanup = out.cleanup || noop;
  var instance = {
    update: update,
    cleanup: cleanup,
    handleEvent: handleEvent
  };

  var nodes = {};
  var names;

  return instance;

  function refresh() {
    var tree = render.apply(null, data);
    names = {};
    apply("", tree);
  }

  function apply(path, item) {
    var type, first, tag;
    if (typeof item === "string") {
      type = "text";
    }
    else if (Array.isArray(item)) {
      if (!item.length) return;
      first = item[0];
      if (typeof first === "function") {
        type = "component";
      }
      else if (typeof first === "string") {
        tag = processTag(item);
        type = "element";
      }
      else {
        item.forEach(function (child) {
          apply(path, child);
        });
        return;
      }
    }
    else {
      console.error(component.name, path, item);
      throw new TypeError("Invalid data");
    }

    var i = 0;
    var name = type === "element" ? (tag.ref || tag.name) :
      type === "component" ? item[0].name : type;
    var newPath;
    while (names[newPath = path + "." + name + i++]);
    names[newPath] = true;

    console.log(component.name, newPath);

    var top = path ? nodes[path] : parent;
    var node = nodes[newPath];
    if (!node) {
      // Node is new, let's create it!
      if (type === "text") {
        node = nodes[newPath] = document.createTextNode(item);
        top.appendChild(node);
        return;
      }
      if (type === "component") {
        var child = createComponent(first, top, instance);
        child.update.apply(null, item.slice(1));
        nodes[newPath] = child;
        return;
      }
      if (type === "element") {
        node = nodes[newPath] = document.createElement(tag.name);
        setAttrs(node, tag.props);
        tag.body.forEach(function (child) {
          apply(newPath, child);
        });
        top.appendChild(node);
        return;
      }
      throw "This shouldn't happen";
    }
    throw "TODO: Update " + component.name + " " + path;
  }

  function update() {
    data = slice.call(arguments);
    refresh();
  }

  function emit() {
    if (!owner) throw new Error("Can't emit events from top-level component");
    owner.handleEvent.apply(null, arguments);
  }

  function handleEvent(name) {
    var handler = on[name];
    if (!handler) {
      if (owner) return owner.handleEvent.apply(null, arguments);
      throw new Error("Missing event handler for " + name);
    }
    handler.apply(null, slice.call(arguments, 1));
  }

}

function processTag(array) {
  var props, body;
  if (array[1].constructor === Object) {
    props = array[1];
    body = array.slice(2);
  }
  else {
    props = {};
    body = array.slice(1);
  }
  var string = array[0];
  var name = string.match(TAG_MATCH);
  var tag = {
    name: name ? name[0] : "div",
    props: props,
    body: body
  };
  var classes = string.match(CLASS_MATCH);
  if (classes) {
    classes = classes.map(stripFirst).join(" ");
    if (props.class) props.class += " " + classes;
    else props.class = classes;
  }
  var id = string.match(ID_MATCH);
  if (id) {
    props.id = stripFirst(id[0]);
  }
  var ref = string.match(REF_MATCH);
  if (ref) {
    tag.ref = stripFirst(ref[0]);
  }
  return tag;
}


function create(tree) {
  if (!tree) return;
  if (typeof tree === "string") {
    return tree;
  }

  if (!Array.isArray(tree)) throw new TypeError("Tree must be array");
  if (!tree.length) return;
  var i = 0;
  var first = tree[i];
  if (typeof first === "string") {
    i++;
    var props = tree[i] && tree[i].constructor === Object ?
      tree[i++] : {};
    var tag = first.match(TAG_MATCH);
    tag = tag ? tag[0] : "div";
    var classes = first.match(CLASS_MATCH);
    if (classes) {
      classes = classes.map(stripFirst).join(" ");
      if (props.class) {
        props.class += " " + classes;
      }
      else props.class = classes;
    }
    var id = first.match(ID_MATCH);
    if (id) props.id = stripFirst(id[0]);
    var obj = { tag: tag };
    var children = tree.slice(i).map(create).filter(Boolean);
    // Only add props if there is at least one key.
    for (var key in props) {
      obj.props = props;
      break;
    }
    if (children.length) obj.children = children;
    var ref = first.match(REF_MATCH);
    if (ref) obj.ref = stripFirst(ref[0]);
    return obj;
  }
  if (Array.isArray(tree[i])) {
    return tree.map(create);
  }
  if (typeof tree[i] !== "function") throw new TypeError("Unexpected value");
  var component = tree[i++];

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

function stripFirst(part) {
  return part.substring(1);
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


/////////////

var FilterableProductTable = require('./filterable-product-table');
var PRODUCTS = require('./products');
var parentNode = document.createElement('div');
var instance = createComponent(FilterableProductTable, parentNode);
instance.update(PRODUCTS);
console.log(parentNode);