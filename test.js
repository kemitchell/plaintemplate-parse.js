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

  test.end() })
