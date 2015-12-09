module.exports = plaintemplate

var IN_TEXT = 0
var IN_TAG = 1
var CONTINUING = 2

var NEWLINE = /^(\n\r?)/

function plaintemplate(input, options) {
  if (options === undefined) {
    options = {
      delimiters: {
        start: '<%',
        end: '%>',
        continue: '{',
        complete: '}' } } }

  var startLength = options.delimiters.start.length
  var endLength = options.delimiters.end.length
  var continueLength = options.delimiters.continue
  var completeLength = options.delimiters.complete

  var lookahead = (function() {
    var lookaheadCache = { }
    return function(length) {
      if (lookaheadCache[length]) {
        return lookaheadCache[length] }
      else {
        var returned = function(index) {
          return input.substr(index, length) }
        lookaheadCache[length] = returned
        return returned } } })()

  var startLookahead = lookahead(startLength)
  var endLookahead = lookahead(endLength)
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
      position: position(line, column) }) }

  function currentTag() {
    var stack = currentStack()
    return stack[stack.length - 1] }

  function advance(length) {
    index += length
    column += length }

  while(index < length) {
    // Not within a tag.
    if (state === IN_TEXT) {
      // Are we at the start of a tag?
      if (startLookahead(index) === options.delimiters.start) {
        state = IN_TAG
        currentStack().push({
          // The `tag` property begins as a string buffer. It is split into
          // space-separated strings when closed.
          tag: '',
          position: position(line, column),
          content: [ ] })
        advance(startLength) }
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
      if (endLookahead(index) === options.delimiters.end) {
        state = IN_TEXT
        // Split the string buffer of tag text into space-separated strings.
        tag.tag = tag.tag.trim().split(/\s+/)
        advance(endLength) }
      // Text within the tag.
      else {
        tag.tag = ( tag.tag + input[index])
        advance(1) } } }
  return output }

function position(line, column) {
  return { line: line, column: column } }
