module.exports = FilterableProductTable;

function FilterableProductTable() {
  return ["div",
    [SearchBar],
    [ProductTable, {
      products: this.products
    }]
  ];
}

function SearchBar() {
  return ["form",
    ["input", {
      type: "text",
      placeholder: "Search..."
    }],
    ["p",
      ["input", {type:"checkbox"},
        "Only show products in stock"
      ]
    ]
  ];
}

function ProductTable() {
  var rows = [];
  var lastCategory = null;
  this.products.forEach(function(product) {
    if (product.category !== lastCategory) {
      rows.push([ProductCategoryRow, {
        category: product.category,
        key: product.category
      }]);
    }
    rows.push([ProductRow, {
      product: product,
      key: product.name
    }]);
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

function ProductCategoryRow() {
  return ["tr",
    ["th", {colspan:2}, this.category]
  ];
}

function ProductRow() {
  var name = this.product.stocked ?
    this.product.name :
    ["span", {style: {color: "red"}},
      this.product.name
    ];
  return ["tr",
    ["td", name],
    ["td", this.product.price]
  ];
}