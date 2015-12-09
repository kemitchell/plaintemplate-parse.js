The package exports a single function returning arrays of token objects for text and template tag tokens, of two arguments:

1. _Input_, a string, containing the template text to parse
2. _Delimiters_, an object with the following keys specifying the syntax for template tags:
  1. `open`, `"<%"` by default
  2. `close`, `"%>"` by default
  3. `start`, `"{"` by default
  3. `end`, `"}"` by default
