module.exports = HelloMessage;

function HelloMessage() {
  return { render: render };
  function render(name) {
    return ["div", "Hello " + name];
  }
}
