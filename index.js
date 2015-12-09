module.exports = plaintemplate

var STARTS_WITH_NEWLINE = /^(\n\r?)/

function plaintemplate(input, options) {
  if (options === undefined) {
    options = {
      delimiters: {
        open: '<%',
        close: '%>',
        start: '{',
        end: '}' } } }

  var openLength = options.delimiters.open.length
  var closeLength = options.delimiters.close.length

  var lookahead = memoize(function(length) {
    return function(index) {
      return input.substr(index, length) } })

  var openLookahead = lookahead(openLength)
  var closeLookahead = lookahead(closeLength)
  var newlineLookahead = lookahead(2)

  // The array of tokens to be returned.
  var output = [ ]

  // A stack of content arrays, like output.
  var contentArrayStack = [ output ]

  // The element at index zero is the content array of the current tag, if any.
  // Subsequent elements are the content arrays of containing tags, and,
  // finally, `output`.
  function currentStack() {
    return contentArrayStack[0] }

  // The current parser state.
  var inTag = false

  // Cache the length of the input string.
  var length = input.length

  // Current parser position information.
  var index = 0
  var line = 1 // Begin at 1.
  var column = 1 // Begin at 1.

  // Append a string to the last text token.
  function appendString(string) {
    var current = currentStack()
    var length = current.length
    if (length > 0) {
      var last = current[length - 1]
      if ('text' in last) {
        last.text = ( last.text + string )
        return } }
    current.push({
      text: string,
      position: currentPosition() }) }

  // Returns the last tag token.
  function currentTag() {
    var stack = currentStack()
    return stack[stack.length - 1] }

  // Advances position counters by a certain number of characters.
  function advance(length) {
    index += length
    column += length }

  // Create a position object at the current parser position.
  function currentPosition() {
    return { line: line, column: column } }

  var error, lastString, match, newline, tag

  // Iterate through the characters of the input.
  while(index < length) {
    // Not within a tag.
    if (!inTag) {
      // Are we at the start of a tag?
      if (openLookahead(index) === options.delimiters.open) {
        inTag = true
        // The `tag` property begins as a string buffer. It is split into
        // space-separated strings when closed.
        currentStack().push({ tag: '', position: currentPosition() })
        advance(openLength) }
      // Not at the start of a tag.
      else {
        // Is this a newline?
        match = STARTS_WITH_NEWLINE.exec(newlineLookahead(index))
        if (match) {
          newline = match[1]
          appendString(newline)
          line++
          column = 1
          index += newline.length }
        // Just text.
        else {
          appendString(input[index])
          advance(1) } } }
    // Within a tag.
    else /* inTag */ {
      // Are we at the end of the tag?
      tag = currentTag()
      if (closeLookahead(index) === options.delimiters.close) {
        // Split the string buffer of tag text into space-separated strings.
        tag.tag = tag.tag.trim().split(/\s+/)
        lastString = tag.tag[tag.tag.length - 1]
        // Start of a continuing tag.
        if (lastString === options.delimiters.start) {
          inTag = false
          // Do not include the start marker.
          tag.tag.pop()
          tag.content = [ ]
          contentArrayStack.unshift(tag.content) }
        // End of a continuing tag.
        else if (lastString === options.delimiters.end) {
          if (contentArrayStack.length > 1) {
            inTag = false
            // Do not include a token for the ending tag.
            currentStack().pop()
            contentArrayStack.shift() }
          else {
            error = new Error(
              'No tag to end at '+
              'line ' + tag.position.line + ', ' +
              'column ' + tag.position.column)
            error.position = tag.position
            throw error } }
        // End of an insert tag.
        else {
          inTag = false }
        advance(closeLength) }
      // Text within the tag.
      else {
        tag.tag = ( tag.tag + input[index])
        advance(1) } } }
  return output }

// Memoize a function that takes a single argument that can be used as keys of
// an object.
function memoize(f) {
  var cache = { }
  return function(argument) {
    if (cache[argument]) {
      return cache[argument] }
    else {
      var result = f(argument)
      cache[argument] = result
      return result } } }
