var render = require('./render');
var FilterableProductTable = require('./filterable-product-table');
var PRODUCTS = require('./products');

var dom = render([FilterableProductTable, {
  products: PRODUCTS
}]);

console.log(dom);
