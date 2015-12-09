var tape = require('tape')
var plaintemplate = require('./')

tape(function(test) {
  test.deepEqual(
    plaintemplate('Just text. No templating.'),
    [ { text: 'Just text. No templating.',
        position: { line: 1, column: 1 } } ])
  test.end() })
