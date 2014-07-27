#!/usr/bin/env node

var
    lhbs       = require ('./lib/learnedhandlebars')
  , program    = require ('commander')
  , p          = require ('path')
  , fs         = require ('fs')
  , _          = require('lodash')
  , JSZip      = require('jszip')
  , docx       = require('./lib/docxutils')
  , pre        = require('./lib/lhbspre')


function list(val) {
  return _.map( val.replace ('++', '[]').split ('+'), function(path) {
    return path.replace ('[]', '+') }
    );
}

program.version('0.0.1')

program
  .command ('clean <path>')
  .action (function(path) {
    var text = fs.readFileSync (path, 'utf8')
      , str = docx.clean(text)
    console.log(str);
  });

program
  .command ('generate <path>')
  .description ('generate a boilerplate using a template')
  .option ('-y, --yaml', 'generate a yaml boilerplate')
  .option ('-j, --json', 'generate json')
  .option ('-i, --import <import-paths>', 'import boilerplates files')
  .action (function(path, options) {
      console.log('path "%s"', path);
      console.log('options "%s"', options);
  });

program
   .command ('compile <path>')
   .description ('compile a template')
   .option ('-i, --import <import-paths>', 'import boilerplates files', list)
   .option ('-o, --output <output-path>', 'output path')
   .action (function(path, options){
     var
         output = p.resolve (process.cwd(), options.output || '')
       , file = fs.readFileSync (path, 'utf8')
       , fileExtension = path.split('.').pop()
       , text
       , compiled
       , boilerplate = { };

    while(options.import.length > 0) {
      var
          i = options.import.shift()
        , b = JSON.parse ( fs.readFileSync (i, 'utf8') );

      _.extend (boilerplate, b);
     }

     switch(fileExtension) {

       case 'pdf':
         break;

       case 'docx':
         var
             doc = fs.readFileSync (path)
           , zip = new JSZip(doc)
           , buffer;

          //["word/document.xml","word/footer1.xml","word/footer2.xml","word/footer3.xml","word/header1.xml","word/header2.xml","word/header3.xml"]

         text = zip.file('word/document.xml').asText();
         text = docx.clean(text, function(err, text) {
           pre(text, 'docx', function(ret) {
             compiled = lhbs.compile (ret) (boilerplate);
             console.log(compiled);
             zip.remove ('word/document.xml');
             zip.file ('word/document.xml', compiled);
             buffer = zip.generate({type:'nodebuffer'})
             fs.writeFileSync (output, buffer);
           });
         });
         break;
       case 'txt':
       case 'html':
       case 'xml':
         text = fs.readFileSync (path, 'utf8');
         pre(text, function() {
           compiled = lhbs.compile (text) (boilerplate)
           fs.writeFileSync (output, compiled);
         });
         break;
     }
   });

program.parse(process.argv);
