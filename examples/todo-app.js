"use strict";

module.exports = TodoApp;

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