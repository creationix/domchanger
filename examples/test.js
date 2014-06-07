// This test is meant to be run from inside the web version tedit
// as "eval in main".  It integrates with the ui/dialog library
// that's internel to tedit.
var createComponent = require('../domchanger');
var dialog = require('ui/dialog');

var tests = [
  [require('./hello'), "Tim"],
  [require('./timer')],
  [require('./todo-app')],
  [require('./filterable-product-table'), require('./products')]
];

go();
function go() {
  var args = tests.shift();
  if (!args) return;
  var Component = args.shift();
  var $ = dialog("Test " + Component.name, ["$parent"], function () {
    $.close();
    instance.destroy();
    go();
  });
  var instance = createComponent(Component, $.parent);
  instance.update.apply(null, args);
}
