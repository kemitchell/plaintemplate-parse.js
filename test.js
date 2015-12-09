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
        position: { line: 1, column: 7 } } ])

  test.deepEqual(
    plaintemplate('Hello <% insert first %> <%insert last%>'),
    [ { text: 'Hello ',
        position: { line: 1, column: 1 } },
      { tag: [ 'insert', 'first' ],
        position: { line: 1, column: 7 } },
      { text: ' ',
        position: { line: 1, column: 25 } },
      { tag: [ 'insert', 'last' ],
        position: { line: 1, column: 26 } } ])

  test.deepEqual(
    plaintemplate('Hello <% insert name%>!\nHow is <% insert state %>?'),
    [ { text: 'Hello ',
        position: { line: 1, column: 1 } },
      { tag: [ 'insert', 'name' ],
        position: { line: 1, column: 7 } },
      { text: '!\nHow is ',
        position: { line: 1, column: 23 } },
      { tag: [ 'insert', 'state' ],
        position: { line: 2, column: 8 } },
      { text: '?',
        position: { line: 2, column: 26 } } ])

  test.end() })
