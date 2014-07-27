var
    request       = require('request')
  , importRegEx   = /{{%import ([^\s]+)%}}/g
  , fs            = require('fs')
  , path          = require('path')
  , JSZip         = require('JSZip')
  , bodyRegEx     = /(<w:body>)(.*)(<\/w:body>)/
  , xmldom        = require('xmldom')
  , DOMParser     = xmldom.DOMParser
  , XMLSerializer = xmldom.XMLSerializer;

function checkURL(str) {
    var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    return urlregex.test(str);
}

module.exports = function(str, type, fn) {
  var
      matches  = str.match (importRegEx)
    , requests = { }
    , ret      = str
    , total    = matches.length
    , counter  = 0
    , h;

  if(!matches) return;

  function isDone() { return ++counter === total; }

  function wordHandler(name, fp, data, error) {
    var
        doc         = new DOMParser().parseFromString (ret)
      , ps          = doc.getElementsByTagName ('w:p')
      , isWordInsert= fp.split('.').pop() === 'docx' || fp.split('.').pop() === 'dxfrag';

    if(isWordInsert && !error) {
      var
         zip = new JSZip(data)
       , data = zip.file('word/document.xml').asText();

      data = data.match (bodyRegEx)[2];

    } else {
      data = '<w:p><w:r><w:t>' + data + '</w:t></w:r></w:p>';
    }

    for(var i = 0; i < ps.length; ++i) {
      var p = ps.item(i);
      if(p.textContent.indexOf(name) !== -1) {
        ret = ret.replace(p.toString(), data);
      }
    }

    if( isDone () ) {
      fn(ret);
    }
  }

  function textHandler(name, fp, data, error) {
    ret = ret.replace (name, data);
    if( isDone () ) {
      fn(ret);
    }
  }

  if (type == 'docx') {
    h = wordHandler;
  } else {
    h = textHandler;
  }

  for(var i = 0; i < total; ++i) {
    var m            = importRegEx.exec (matches[i])
      , name         = m[0]
      , fp           = m[1]
      , isURL        = checkURL(fp)
      , isWordInsert = fp.split('.').pop() === 'docx' || fp.split('.').pop() === 'dxfrag';

    if( !requests[name] ) {
      requests[name] = fp;
      if( isURL ) {
        var options = {
          url     : fp,
          encoding: isWordInsert ? null : 'utf8'
        }

        request.get(options, function (error, response, body) {
          var val = (!error && response.statusCode == 200) ?
                    body :
                      '!Error getting ' + fp + '!';
          h(name, fp, val, error);
        });
      } else {
        fs.readFile( path.resolve( process.cwd(), fp), isWordInsert ? null : 'utf8', function(error, body) {
          var val = !error ? body : '!Error getting ' + fp + '!';
          h(name, fp, val, error);
        });
      }
    }
  }
}
