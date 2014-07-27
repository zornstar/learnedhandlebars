var
    sax         = require('sax')
  , parser      = sax.parser(true)
  , buffer      = '<?xml version="1.0" encoding="UTF-8"?>'
  , intermediate= ""
  , t           = true
  , OPEN        = '{'
  , CLOSE       = '}'
  , textNode    = 'w:t'
  , openText    = false
  , stopCloseAfter  = false
  , proofErr    = 'w:proofErr'

module.exports.clean = clean = function(d, fn) {
  onEnd = fn
  var p = parser.write(d).end()
  buffer = "", intermediate = ""
}

function target() {
  return t ? buffer : intermediate;
}

function addTarget(add) {
  if(t) buffer+=add
  else intermediate+=add;
}

function isOpen(name) {
  return (name !== proofErr && name !== textNode) || !openText;
}
function openNodeToString(node) {
  var str = '<' + node.name;

  for(var attr in node.attributes) {
    str+= ' ' + attr + '="' + node.attributes[attr] +'"';
  }

  return str + '>';
}

parser.onerror = function(error) {

}

parser.ontext = function(text) {

  //case 1: multiple
  buffer+=text;
  var o = text.lastIndexOf(OPEN), c = text.lastIndexOf(CLOSE);

  if (o > -1) {
    t = false;
    openText = true;
  }

  if (c > o) {
    buffer = buffer + '</w:t>' + intermediate || "";
    t = true;
    intermediate = "";
    openText = false;
    stopCloseAfter = true;
  }
}

parser.onopentag = function(node) {
  if( isOpen (node.name) )  {
    addTarget(openNodeToString(node));
  }
}

parser.onclosetag = function(node) {

  if( !stopCloseAfter && isOpen(node) )  {
    addTarget('</' + node + '>');
  }

  stopCloseAfter = false;
}

parser.onend = function() {
  onEnd(null, buffer);
}

/**************************************/
var
    JSZip = require('jszip')
  , fs    = require('fs');

module.exports.unzip = unzip = function(path) {
  var
      doc = fs.readFileSync (path)
    , zip = new JSZip(doc)
    , ret = {
        text:  zip.file('word/document.xml').asText()
      }
  return ret;
}

module.exports.unpack = function(path, key, fn) {
  return clean(unzip(path)[key], fn);
}
