module.exports = plaintemplate

var TEXT = 0
var OPEN = 1
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
  var state = TEXT

  var length = input.length
  var line = 1
  var column = 1
  var index = 0

  function appendString(string) {
    var currentStack = listStack[0]
    var length = currentStack.length
    if (length > 0) {
      var last = currentStack[length - 1]
      if ('text' in last) {
        last.text = ( last.text + string )
        return } }
    currentStack.push({
      text: string,
      position: position(line, column) }) }

  while(index < length) {
    if (state === TEXT) {
      if (startLookahead(index) === options.delimiters.start) {
        state = OPEN
        listStack[0].push({
          tag: '',
          position: position(line, column),
          content: [ ] })
        column += startLength
        index++ }
      else {
        var newlineMatch = NEWLINE.exec(newlineLookahead(index))
        if (newlineMatch) {
          var newline = newlineMatch[1]
          appendString(newline)
          line++
          column = 1
          index += newline.length }
        else {
          appendString(input[index])
          index++ } } } }
  return output }

function position(line, column) {
  return { line: line, column: column } }
