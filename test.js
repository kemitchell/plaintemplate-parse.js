var tape = require('tape')
var plaintemplate = require('./')

tape(function(test) {
  test.deepEqual(
    plaintemplate('Just text. No templating.'),
    [ { text: 'Just text. No templating.',
        position: { line: 1, column: 1 } } ])

  test.deepEqual(
    plaintemplate('Hello <% insert name %>'),
    [ { text: 'Hello ',
        position: { line: 1, column: 1 } },
      { tag: [ 'insert', 'name' ],
        position: { line: 1, column: 7 },
        content: [ ] } ])

  test.deepEqual(
    plaintemplate('Hello <% insert first %> <%insert last%>'),
    [ { text: 'Hello ',
        position: { line: 1, column: 1 } },
      { tag: [ 'insert', 'first' ],
        position: { line: 1, column: 7 },
        content: [ ] },
      { text: ' ',
        position: { line: 1, column: 25 } },
      { tag: [ 'insert', 'last' ],
        position: { line: 1, column: 26 },
        content: [ ] } ])

  test.end() })
