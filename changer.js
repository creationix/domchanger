"use strict";
module.exports = createComponent;

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
    destroy: destroy,
    handleEvent: handleEvent
  };

  var nodes = {};
  var names;
  var comment = document.createComment(component.name);
  parent.appendChild(comment);

  return instance;

  function destroy() {
    comment.parentNode.removeChild(comment);
    comment = null;
    Object.keys(nodes).forEach(function (key) {
      var node = nodes[key];
      if (node.destroy) node.destroy();
      else node.el.parentNode.removeChild(node.el);
      delete nodes[key];
    });
    delete instance.update;
    delete instance.destroy;
    delete instance.handleEvent;
    cleanup();
  }

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
      type === "component" ? item.key || item[0].name : type;
    var newPath;
    while (names[newPath = path + "\0" + name + i++]);
    names[newPath] = true;

    var top = path ? nodes[path].el : parent;
    var node = nodes[newPath];
    if (type === "text") {
      if (node) {
        if (node.text !== item) {
          node.el.nodeValue = item;
          node.text = item;
        }
      }
      else {
        node = nodes[newPath] = {
          el: document.createTextNode(item),
          text: item
        };
        top.appendChild(node.el);
      }
    }
    else if (type === "component") {
      if (!node) {
        node = createComponent(first, top, instance);
        nodes[newPath] = node;
      }
      node.update.apply(null, item.slice(1));
    }
    else if (type === "element") {
      if (!node) {
        tag.el = document.createElement(tag.name);
        node = nodes[newPath] = tag;
        if (tag.ref) refs[tag.ref] = node.el;
        updateAttrs(node.el, {}, tag.props);
        top.appendChild(node.el);
      }
      else {
        console.log(tag.props);
        console.log(node.props);
        // TODO: fast update
        updateAttrs(node.el, node.props, tag.props);
        node.props = tag.props;
      }
      tag.body.forEach(function (child) {
        apply(newPath, child);
      });
    }
    else {
      throw "This shouldn't happen";
    }
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

function stripFirst(part) {
  return part.substring(1);
}

function updateAttrs(node, old, attrs) {
  // Update any changed attributes.
  var keys = Object.keys(attrs), key;
  for (var i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    var value = attrs[key];
    if (old[key] === value) continue;
    if (key === "style" && value.constructor === Object) {
      updateStyle(node.style, old.style || {}, value);
    } else if (key.substr(0, 2) === "on") {
      node.addEventListener(key.substr(2), value, false);
    } else if (typeof value === "boolean") {
      if (value) node.setAttribute(key, key);
    } else {
      node.setAttribute(key, value);
    }
  }
  // Remove attributes no longer in list
  keys = Object.keys(old);
  for (i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    if (attrs.hasOwnProperty(key)) continue;
    node.removeAttribute(key);
  }
}

function updateStyle(style, old, attrs) {
  var keys = Object.keys(attrs), key;
  for (var i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    var value = attrs[key];
    if (old[key] === value) continue;
    style[key] = attrs[key];
  }
  keys = Object.keys(old);
  for (i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    if (attrs.hasOwnProperty(key)) continue;
    style[key] = "";
  }
}

/////////////

var dialog = require('ui/dialog');

var FilterableProductTable = require('./filterable-product-table');
var PRODUCTS = require('./products');
var $ = dialog("Program", ["$parent"], onClose);

var instance = createComponent(FilterableProductTable, $.parent);
instance.update(PRODUCTS);
console.log($.parent);
function onClose() {
  instance.destroy();
  $.close();
}
