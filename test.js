var changer = require('./changer');
var FilterableProductTable = require('./filterable-product-table');
var PRODUCTS = require('./products');

var dom = changer([FilterableProductTable, PRODUCTS]);

console.log(dom);
