( // Module boilerplate to support component, browser globals and AMD.
  (typeof module === "object" && typeof module.exports === "object" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define("domchanger", m); }) ||
  (function (m) { window.domChanger = m(); })
)(function () {
"use strict";

function createComponent(component, parent, owner) {
  var refs = {};
  var data = [];
  var roots = {};
  // console.log("new " + component.name);
  var out = component(emit, refresh, refs);
  var render = out.render;
  var on = out.on || {};
  var cleanup = out.cleanup || noop;
  var instance = {
    update: update,
    destroy: destroy,
    append: append,
    handleEvent: handleEvent
  };

  // Add comment for this component.
  var comment = document.createComment(component.name);
  parent.appendChild(comment);

  return instance;

  function append() {
    comment.parentNode.appendChild(comment);
    Object.keys(roots).forEach(function (key) {
      var node = roots[key];
      if (node.el) parent.appendChild(node.el);
      else if (node.append) node.append();
    });
  }

  function destroy() {
    // console.log("destroy", component.name);
    comment.parentNode.removeChild(comment);
    comment = null;
    cleanRoots(roots);
    delete instance.update;
    delete instance.destroy;
    delete instance.handleEvent;
    cleanup();
  }

  function cleanRoots(roots) {
    Object.keys(roots).forEach(function (key) {
      var node = roots[key];
      if (node.el) node.el.parentNode.removeChild(node.el);
      else if (node.destroy) node.destroy();
      delete roots[key];
      if (node.children) cleanRoots(node.children);
    });
  }

  function refresh() {
    var tree = nameNodes(render.apply(null, data));
    apply(parent, tree, roots);
  }

  function apply(top, newTree, oldTree) {

    // Delete any items that don't exist in the new tree
    Object.keys(oldTree).forEach(function (key) {
      if (!newTree[key]) {
        var item = oldTree[key];
        if (item.destroy) item.destroy();
        else item.el.parentNode.removeChild(item.el);
        delete oldTree[key];
      }
    });

    Object.keys(newTree).forEach(function (key) {
      var item = oldTree[key];
      var newItem = newTree[key];

      if (newItem.text !== undefined) {
        if (!item) {
          item = oldTree[key] = {
            text: newItem.text,
            el: document.createTextNode(newItem.text)
          };
        }
        else {
          if (newItem.text !== item.text) {
            item.text = newItem.text;
            item.el.nodeValue = newItem.text;
          }
        }
        // Move to bottom or append.
        top.appendChild(item.el);
        return;
      }

      if (newItem.component) {
        if (!item) {
          item = oldTree[key] = createComponent(newItem.component, top, instance);
        }
        item.update.apply(null, newItem.data);
        item.append();
        return;
      }

      if (newItem.tagName) {
        if (!item) {
          item = oldTree[key] = {
            tagName: newItem.tagName,
            el: document.createElement(newItem.tagName),
            children: {}
          };
          if (newItem.ref) {
            item.ref = newItem.ref;
            refs[item.ref] = item.el;
          }
        }
        if (newItem.props !== item.props) {
          updateAttrs(item.el, newItem.props, item.props);
          item.props = newItem.props;
        }
        if (newItem.children) {
          apply(item.el, newItem.children, item.children);
        }
        top.appendChild(item.el);
        return;
      }

      console.error(newItem);
      throw new Error("This shouldn't happen");

    });
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


// Given raw JSON-ML data, return a virtual DOM tree with auto-named nodes.
function nameNodes(raw) {
  var tree = {};
  processItem(tree, raw);
  return tree;

  function processItem(nodes, item) {

    // Figure out what type of item this is and normalize data a bit.
    var type, first, tag;
    if (typeof item === "number") {
      item = String(item);
    }
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
          processItem(nodes, child);
        });
        return;
      }
    }
    else {
      console.error(item);
      throw new TypeError("Invalid item");
    }

    // Find a unique name for this local namespace.
    var i = 0;
    var name = type === "element" ? (tag.ref || tag.name) :
      type === "component" ? item.key || item[0].name : type;
    var newPath;
    while (nodes[newPath = name + "-" + i++]);

    var node;

    if (type === "text") {
      nodes[newPath] = {
        text: item
      };
      return;
    }

    if (type === "element") {
      var sub = {};
      node = nodes[newPath] = {
        tagName: tag.name,
      };
      if (!isEmpty(tag.props)) node.props = tag.props;
      if (tag.ref) node.ref = tag.ref;
      tag.body.forEach(function (child) {
        processItem(sub, child);
      });
      if (!isEmpty(sub)) node.children = sub;
      return;
    }

    if (type === "component") {
      nodes[newPath] = {
        component: item[0],
        data: item.slice(1)
      };
      return;
    }

    throw new TypeError("Invalid type");
  }

}

// Parse and process a JSON-ML element.
function processTag(array) {
  var props, body;
  if (array[1] && array[1].constructor === Object) {
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

function updateAttrs(node, attrs, old) {
  if (old) Object.keys(old).forEach(function (key) {
    if (attrs && attrs[key]) return;
    if (key.substr(0, 2) === "on") {
      node.removeEventListener(key.substr(2), old[key], false);
    }
    else {
      node.removeAttribute(key);
    }
  });
  if (attrs) Object.keys(attrs).forEach(function (key) {
    var value = attrs[key];
    if (key === "style" && value.constructor === Object) {
      updateStyle(node.style, value, old && old.style);
    }
    else if (old && (old[key] === value)) {
      return;
    }
    else if (key.substr(0, 2) === "on") {
      node.addEventListener(key.substr(2), value, false);
    }
    else if (typeof value === "boolean") {
      if (value) node.setAttribute(key, key);
    }
    else {
      node.setAttribute(key, value);
    }
  });
}

function updateStyle(style, attrs, old) {
  if (old) Object.keys(old).forEach(function (key) {
    if (attrs && attrs[key]) return;
    style[key] = "";
  });
  if (attrs) Object.keys(attrs).forEach(function (key) {
    var value = attrs[key];
    if (old && old[key] === value) return;
    style[key] = attrs[key];
  });
}

function stripFirst(part) {
  return part.substring(1);
}

function isEmpty(obj) {
  return !Object.keys(obj).length;
}

var CLASS_MATCH = /\.[^.#$]+/g,
    ID_MATCH = /#[^.#$]+/,
    REF_MATCH = /\$[^.#$]+/,
    TAG_MATCH = /^[^.#$]+/;

var slice = [].slice;
function noop() {}

return createComponent;

});
