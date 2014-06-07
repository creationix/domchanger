"use strict";
// This example shows how to use the cleanup hook to do cleanup.
// We don't want this interval to continue running after the component is gone.

module.exports = Timer;

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
