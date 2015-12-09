var tape = require('tape')
var plaintemplate = require('./')

tape('plaintemplate-parse', function(test) {
  test.deepEqual(
    plaintemplate('Just text. No templating.'),
    [ { text: 'Just text. No templating.',
        position: { line: 1, column: 1 } } ],
    'just text')

  test.deepEqual(
    plaintemplate('Hello <% insert name %>!'),
    [ { text: 'Hello ',
        position: { line: 1, column: 1 } },
      { tag: 'insert name',
        position: { line: 1, column: 7 } },
      { text: '!',
        position: { line: 1, column: 24 } } ],
    'insert')

  test.deepEqual(
    plaintemplate('Hello <% insert first %> <%insert last%>'),
    [ { text: 'Hello ',
        position: { line: 1, column: 1 } },
      { tag: 'insert first',
        position: { line: 1, column: 7 } },
      { text: ' ',
        position: { line: 1, column: 25 } },
      { tag: 'insert last',
        position: { line: 1, column: 26 } } ],
    'two inserts')

  test.deepEqual(
    plaintemplate('Hello <% insert name%>!\nHow is <% insert state %>?'),
    [ { text: 'Hello ',
        position: { line: 1, column: 1 } },
      { tag: 'insert name',
        position: { line: 1, column: 7 } },
      { text: '!\nHow is ',
        position: { line: 1, column: 23 } },
      { tag: 'insert state',
        position: { line: 2, column: 8 } },
      { text: '?',
        position: { line: 2, column: 26 } } ],
    'two lines')

  test.deepEqual(
    plaintemplate('<% if onsale { %>Price: $<% insert price %><% } %>'),
    [ { tag: 'if onsale',
        position: { line: 1, column: 1 },
        content: [
          { text: 'Price: $',
            position: { line: 1, column: 18 } },
          { tag: 'insert price',
            position: { line: 1, column: 26 } } ] } ],
    'if then insert')

  test.deepEqual(
    plaintemplate(
      '{{ if onsale start }}Price: ${{ insert price }}{{ end }}',
      { open: '{{',
        close: '}}',
        start: 'start',
        end: 'end' }),
    [ { tag: 'if onsale',
        position: { line: 1, column: 1 },
        content: [
          { text: 'Price: $',
            position: { line: 1, column: 22 } },
          { tag: 'insert price',
            position: { line: 1, column: 30 } } ] } ],
    'mustache syntax')

  test.throws(
    function() { plaintemplate('This is <% } %> invalid.') },
    /No tag to end at line 1, column 9/,
    'orphan closing tag throws')

  test.throws(
    function() { plaintemplate('This is <% if x { %> invalid.') },
    /Unclosed tag at line 1, column 9/,
    'orphan opening tag throws')

  test.end() })
