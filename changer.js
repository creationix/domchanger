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
      else node.parentNode.removeChild(node);
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

function stripFirst(part) {
  return part.substring(1);
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
setTimeout(function () {
  instance.destroy();
  console.log(parentNode);
}, 3000);
