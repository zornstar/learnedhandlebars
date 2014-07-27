# Learned Handlebars
![Alt text](lhbs_logo.png)

*Teaching Handlebars.js some new tricks*

LearnedHandlebars is a custom handlebars.js compiler that aims to:

- Make office documents highly modular.

- Facilitate the reuse of document components across different documents.

- Make it easy to import document fragments and boilerplate from other projects.
locally or on the web.

- Support for any type of text file (e.g., .md, .html, .xml, .yml, .txt, etc.) in addition to a few other commonly word processing/text file formats (.pdf, .docx, .odt).

- Enable the use of plugin scripts to be run at or after compile time.


## Features

- Built-in helpers to handlebars.js to enable additional logic.

- Preprocessor to "import" documents or document fragments into templates.

- Generator that parses handlebars tags in a template file to create a pre-populated "boilerplate" .json / .yml

- Compiler to compile templates and boilerplates into a compiled document.

- Command line utility to generate boilerplates from templates

## Preprocessor

- `{{%import [filepath]%}}`

Import from a local file path relative to the current working directory a .md, .html, .xml, .yml, .txt as plain text or .odt, .docx with formatting

- `{{%import [filepath]%}}`

Import from a local file path relative to the current working directory a .md, .html, .xml, .yml, .txt as plain text or .odt, .docx with formatting

- `lhbs preprocess <templatepath>` (command line)

Preprocess a template, processed template in the current working directory with name <template>-processed by default.


## Generator (from command line)

- `./lhbs.js generate <templatepath>`

Generate boilerplate.  By default the boilerplate will have same name as the template

##### Flags

- `-j, --json`

Create boilerplate as .json [default]

- `-y, --yaml`

Create boilerplate as .yaml

- `-i, --import <filepaths_separated_by_+>`

Pre-import boilerplates into the generated boilerplate.

##### Example

- `./lhbs.js generate template.html --import name.json+address.json`

Generates a boilerplate named template.json in the current working directory prepopulating
template.json with name.json and address.json, in that order.

## Compiler (from command line)

`lhbs compile <templatepath>`

Compile template to the current working directory with name <template>-compiled by default.

##### Flags

- `-i, --import <filepaths_separated_by_+>`

Filepaths to boilerplates to use

- `-o, --output <filepath>`

Filepath to output boilerplate to.

- `-p, --plugin <pluginpath>`

Plugins to execute with the compiled boilerplate

##### Example

- `./lhbs.js lhbs compile template.html --import name.json+address.json --output /path/to/output/output.html`

Generates a boilerplate named template.json in the current working directory prepopulating
template.json with name.json and address.json, in that order.

## Future / To-Do
- Build tool to quickly scaffold templates/boilerplate
