Roll your own Mustache-like plaintext template language with custom syntax.

```javascript
var parse = require('plaintemplate-parse')
var assert = require('assert')

assert.deepEqual(
  parse(
    // Template input
    '(( five { ))Howdy, (( = name ))! (( } ))',
    // Use custom double-parentheses template tags.
    { open: '((', close: '))', start: '{', end: '}' }),
  [ { tag: 'five',
      position: { line: 1, column: 1 },
      content: [
        { text: 'Howdy, ',
          position: { line: 1, column: 13 } },
        { tag: '= name',
          position: { line: 1, column: 20 } },
        { text: '! ',
          position: { line: 1, column: 32 } } ] } ])
```

The package exports a single function returning arrays of token objects for text and template tag tokens, of two arguments:

1. _Input_, a string, containing the template text to parse
2. _Delimiters_, an object with the following keys specifying the syntax for template tags:
    1. `open`, `"<%"` by default
    2. `close`, `"%>"` by default
    3. `start`, `"{"` by default
    3. `end`, `"}"` by default
