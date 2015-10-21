DomChanger
==========

[![Join the chat at https://gitter.im/creationix/domchanger](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/creationix/domchanger?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a small library that lets your build react.js style websites, but with
minimal dependencies and using JSON-ML style syntax instead of JSX.

## A Simple Component

DomChanger components are simply functions that export a given interface.
The main export is a `render()` function that takes input data and returns what
to display. HTML nodes are described using JSON-ML syntax.

```js
// Defining the component
function HelloMessage() {
  return { render: render };
  function render(name) {
    return ["div", "Hello " + name];
  }
}

// Creating a instance attached to document.body
var instance = domChanger(HelloMessage, document.body);
// Send in the initial data to render.
instance.update("Tim");
```

You can also `instance.destroy()` when you're done with the component and wish
to destroy it.

## A Stateful Component

In addition to taking input data (accessed via update arguments), a component
can maintain internal state data (accessed via local variables in the closure).
A component can call `refresh` when it's state has been changed.

```js
function Timer(emit, refresh) {
  var secondsElapsed = 0;
  var interval = setInterval(tick, 1000);
  return {
    render: render,
    cleanup: cleanup
  };
  function render() {
    return ["div", "Seconds Elapsed: ", secondsElapsed];
  }
  function tick() {
    secondsElapsed++;
    refresh();
  }
  function cleanup() {
    clearInterval(interval);
  }
}
```

## An Application

Using update data and closure state, we can put together a small Todo
application. This example uses state to track the current list of items as well
as the text that the user has entered.

```js
function TodoApp(emit, refresh) {
  var items = [], text = "";

  return { render: render };

  function render() {
    return ["div",
      ["h3", "TODO"],
      [TodoList, items],
      ["form", { onsubmit: handleSubmit },
        ["input", {
          onchange: onChange,
          value: text
        }],
        ["button", "Add #", items.length + 1]
      ]
    ];
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    items.push(text);
    text = "";
    refresh();
  }

  function onChange(evt) {
    text = evt.target.value;
  }
}

function TodoList() {
  return { render: render };
  function render(items) {
    return ["ul", items.map(function (itemText) {
      return ["li", itemText];
    })];
  }
}
```


## Live Example

You can play around with a larger example in this [fiddle](http://jsfiddle.net/BsUDE/3/).

<iframe src="http://jsfiddle.net/BsUDE/3/embedded/js,result/"></iframe>
