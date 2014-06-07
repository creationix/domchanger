// This test is meant to be run from inside the web version tedit
// as "eval in main".  It integrates with the ui/dialog library
// that's internel to tedit.

var createComponent = require('./domchanger');
var dialog = require('ui/dialog');

var FilterableProductTable = require('./filterable-product-table');
var $ = dialog("Program", ["$parent"], function () {
  $.close();
  instance.destroy();
});
var instance = createComponent(FilterableProductTable, $.parent);
instance.update(require('./products'));
console.log($.parent);
