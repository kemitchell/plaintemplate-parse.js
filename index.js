module.exports = plaintemplate

var IN_TEXT = 0
var IN_TAG = 1

var NEWLINE = /^(\n\r?)/

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

  var lookahead = (function() {
    var cache = { }
    return function(length) {
      if (cache[length]) {
        return cache[length] }
      else {
        var returned = function(index) {
          return input.substr(index, length) }
        cache[length] = returned
        return returned } } })()

  var openLookahead = lookahead(openLength)
  var closeLookahead = lookahead(closeLength)
  var newlineLookahead = lookahead(2)

  var output = [ ]
  var listStack = [ output ]
  var state = IN_TEXT

  var length = input.length
  var line = 1
  var column = 1
  var index = 0

  function currentStack() {
    return listStack[0] }

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

  function currentTag() {
    var stack = currentStack()
    return stack[stack.length - 1] }

  function advance(length) {
    index += length
    column += length }

  function currentPosition() {
    return position(line, column) }

  while(index < length) {
    // Not within a tag.
    if (state === IN_TEXT) {
      // Are we at the start of a tag?
      if (openLookahead(index) === options.delimiters.open) {
        state = IN_TAG
        currentStack().push({
          // The `tag` property begins as a string buffer. It is split into
          // space-separated strings when closed.
          tag: '',
          position: currentPosition() })
        advance(openLength) }
      // Not at the start of a tag.
      else {
        // Is this a newline?
        var newlineMatch = NEWLINE.exec(newlineLookahead(index))
        if (newlineMatch) {
          var newline = newlineMatch[1]
          appendString(newline)
          line++
          column = 1
          index += newline.length }
        // Just text.
        else {
          appendString(input[index])
          advance(1) } } }
    // Within a tag.
    else if (state === IN_TAG) {
      // Are we at the end of the tag?
      var tag = currentTag()
      if (closeLookahead(index) === options.delimiters.close) {
        // Split the string buffer of tag text into space-separated strings.
        tag.tag = tag.tag.trim().split(/\s+/)
        advance(closeLength)
        var lastString = tag.tag[tag.tag.length - 1]
        // Start of a continuing tag.
        if (lastString === options.delimiters.start) {
          state = IN_TEXT
          // Do not include the start marker.
          tag.tag.pop()
          tag.content = [ ]
          listStack.unshift(tag.content) }
        // End of a continuing tag.
        else if (lastString === options.delimiters.end) {
          if (listStack.length > 0) {
            state = IN_TEXT
            // Do not include a token for the ending tag.
            currentStack().pop()
            listStack.shift() }
          else {
            throw new Error('Invalid end of tag') } }
        // End of an insert tag.
        else {
          state = IN_TEXT } }
      // Text within the tag.
      else {
        tag.tag = ( tag.tag + input[index])
        advance(1) } } }
  return output }

function position(line, column) {
  return { line: line, column: column } }
