module.exports = FilterableProductTable;

function FilterableProductTable(props) {
  return ["div",
    [SearchBar],
    [ProductTable, {
      products: props.products
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

function ProductTable(props) {
  var rows = [];
  var lastCategory = null;
  props.products.forEach(function(product) {
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

function ProductCategoryRow(props) {
  return ["tr",
    ["th", {colspan:2}, props.category]
  ];
}

function ProductRow(props) {
  var name = props.product.stocked ?
    props.product.name :
    ["span", {style: {color: "red"}},
      props.product.name
    ];
  return ["tr",
    ["td", name],
    ["td", props.product.price]
  ];
}