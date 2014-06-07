"use strict";

// state is stored using local variables in the closure

// `emit` is for emitting events upstream
// `refresh` is for re-rendering self and children

// `render` must be exported by all components
// `cleaup` is optional and it called when instance is destroyed
// `on` is an object who's properties are event handlers

module.exports = FilterableProductTable;

function FilterableProductTable(emit, refresh) {
  var filterText = '';
  var inStockOnly = false;
  return {
    render: render,
    on: { userInput: onUserInput }
  };
  function render(products) {
    return ["div",
      [SearchBar, filterText, inStockOnly],
      [ProductTable, products, filterText, inStockOnly]
    ];
  }
  function onUserInput(text, checked) {
    filterText = text;
    inStockOnly = checked;
    refresh();
  }
}

function SearchBar(emit, refresh, refs) {
  return { render: render };
  function render(filterText, inStockOnly) {
    return ["form", { onsubmit: cancel },
      ["input$filterText", {
        type: "text",
        placeholder: "Search...",
        onkeyup: handleChange,
        value: filterText
      }],
      ["p",
        ["input$inStockOnly", {
          type: "checkbox",
          onchange: handleChange,
          checked: !!inStockOnly
        }],
        "Only show products in stock"
      ]
    ];
  }
  function cancel(evt) {
    evt.preventDefault();
  }
  function handleChange() {
    emit("userInput",
      refs.filterText.value,
      refs.inStockOnly.checked
    );
  }
}

function ProductTable() {
  return { render: render };
  function render(products, filterText, inStockOnly) {
    var rows = [];
    var lastCategory = null;
    products.forEach(function(product) {
      if (product.name.indexOf(filterText) === -1 ||
          (!product.stocked && inStockOnly)) {
        return;
      }
      var item;
      if (product.category !== lastCategory) {
        item = [ProductCategoryRow, product.category];
        item.key = product.category;
        rows.push(item);
      }
      item = [ProductRow, product];
      item.key = product.name;
      rows.push(item);

      lastCategory = product.category;
    });

    return ["table",
      ["thead",
        ["tr",
          ["th", "Name"],
          ["th", "Price"]
        ]
      ],
      ["tbody", rows]
    ];
  }
}

function ProductCategoryRow() {
  return { render: render };
  function render(category) {
    return ["tr",
      ["th", {colspan:2}, category]
    ];
  }
}

function ProductRow() {
  return { render: render };
  function render(product) {
    var name = product.stocked ?
      product.name :
      ["span", {style: {color: "red"}},
        product.name
      ];
    return ["tr",
      ["td", name],
      ["td", product.price]
    ];
  }
}
