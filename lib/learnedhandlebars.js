'use strict';

var Handlebars = require ('handlebars')
  , _ = require('lodash');


var LearnedHandlebars = Handlebars;

function hb(tag) {return "{{ " + tag + " }}" }

LearnedHandlebars.helperTypes = {
  'after':'array',
  'before':'array',
  'first':'array',
  'last':'array',
  'withAfter':'array',
  'withBefore':'array',
  'withFirst':'array',
  'withLast':'array',
  'sort':'array',
  'now':'none',
  'withSort':'array',
  'if':'single',
  'each':'array',
  'with':'object',
  'unless':'single'
}

LearnedHandlebars.helperType = function(helper) { return LearnedHandlebars.helperTypes[helper]; }

var helpers = {

/**
 * Begin code from: Handlebars Collections Helpers
 * Copyright (c) 2013 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT).
 */

  after: function(array, count) { return array.slice(count); },
  before: function(array, count) { return array.slice(0, -count);},
  first: function (array, count) {
    if (_.isUndefined(count)) {
      return array[0];
    } else {
      return array.slice(0, count);
    }
  },
  last: function (array, count) {
    if (_.isUndefined(count)) {
      return array[array.length - 1];
    } else {
      return array.slice(-count);
    }
  },
  withAfter: function (array, count, options) {
    console.log(options);
    array = array.slice(count);
    var result = '';
    for (var item in array) {
      result += options.fn(array[item]);
    }
    //console.log(result);
    return result;
  },
  withBefore: function (array, count, options) {
    array = array.slice(0, -count);
    var result = '';
    for (var item in array) {
      result += options.fn(array[item]);
    }
    return result;
  },
  withFirst: function(array, options) {

    if (!_.isUndefined(array)) {
      return options.fn(array[0]);
    } else {
      return console.error('{{withFirst}} takes at least one argument (array).');
    }
  },
  withLast: function (array, count, options) {
    if (_.isUndefined(count)) {
      options = count;
      return options.fn(array[array.length - 1]);
    } else {
      array = array.slice(-count);
      var result = '';
      for (var item in array) {
        result += options.fn(array[item]);
      }
      return result;
    }
  },
  sort: function (array, field) {
    if (_.isUndefined(field)) {
      return array.sort();
    } else {
      return array.sort(function (a, b) {
        return a[field] > b[field];
      });
    }
  },
  now: function (format) {
    var date = new Date();
    if (_.isUndefined(format)) {
      return date;
    } else {
      return Dates.format(date, format);
    }
  },
  withSort: function (array, field, options) {
    array = _.cloneDeep(array);
    var getDescendantProp = function (obj, desc) {
      var arr = desc.split('.');
      while (arr.length && (obj = obj[arr.shift()])) {
        continue;
      }
      return obj;
    };
    var result = '';
    var item;
    var i;
    var len;
    if (_.isUndefined(field)) {
      options = field;
      array = array.sort();
      if (options.hash && options.hash.dir === 'desc') {
        array = array.reverse();
      }
      for (i = 0, len = array.length; i < len; i++) {
        item = array[i];
        result += options.fn(item);
      }
    } else {
      array = array.sort(function (a, b) {
        var aProp = getDescendantProp(a, field);
        var bProp = getDescendantProp(b, field);
        if (aProp > bProp) {
          return 1;
        } else {
          if (aProp < bProp) {
            return -1;
          }
        }
        return 0;
      });
      if (options.hash && options.hash.dir === 'desc') {
        array = array.reverse();
      }
      for (item in array) {
        result += options.fn(array[item]);
      }
    }
    return result;
  }

  /**
   * End
   */
}

function hasFormatting(string) {
  var serial_re = /%%/
    , mono_re = /(?:\s+)([%])/;
}

function serial() {

  var args = Array.prototype.slice.call(arguments);

  switch(args.length) {
  case 1: return String(args);
  case 2: return args[0] + " " + args[1];
  default:
    var last = args.pop();
    return args.join(", ") + ", and " + last;
  }
}

function formatter(string) {

  return function() {
    var args = Array.prototype.slice.call(arguments);
    if(args.length == 0) return string;
    var serial_re = /%%/
      , mono_re = /(?:\s+)([%])/;

    var matches = string.match(serial_re);

    if(matches) {
      var args = Array.prototype.slice.call(arguments);
      var options = args.pop();
      return string.replace(serial_re, serial.apply(this, args));
    }

    var arg;

    while(string.match(mono_re) && ( arg = args.shift() ) ) {

      string = string.replace(mono_re, arg);
    }
    return string;
  }
}

LearnedHandlebars.JavaScriptCompiler.prototype.nameLookup = function (parent, name, type) {

    //if (name.indexOf("xRoot") === 0) { return "data"; }

    var wrap,
        ret;
    if (parent.indexOf('depth') === 0) {
      wrap = true;
    }

    if (LearnedHandlebars.JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
      ret = parent + "." + name;
    } else {
      ret = parent + "['" + name + "']";
    }

    if (wrap) {
      return '(' + parent + ' && ' + ret + ')';
    } else {
      return ret;
    }
};

/*
function mono_format(string) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    if(args.length == 0) return string;
    var re = /(?:\s+)([%])/;
    console.log(string.match(re));
    console.log(args);
    while(string.match(re) && ( arg = args.shift() ) ) {

      string = string.replace(re, arg);
    }
    return string;
  }
}

function serial_format(string) {
  return function() {
    var re = /%%/;
    var matches = string.match(re);
    if(matches[0]) {
      var args = Array.prototype.slice.call(arguments);
      var options = args.pop();
      return string.replace(re, serial.apply(this, args));
    }
  }
}
*/

/* Create a helper that will enable mono formatting, e.g.,
/* store: "Let's pick up milk from % and take it %.  =>
/*   {store milk cookies cheese} =>
/*      Let's pick up some milk, cookies, and cheese from the store. */

/* Create a helper that will enable serial formatting, e.g.,
/* store: "Let's pick up %% from the store." =>
/*   {store 'milk' 'cookies' 'cheese'} =>
/*      Let's pick up some milk, cookies, and cheese from the store. */

LearnedHandlebars.registerFormatter = function(str, f) {
  var fn = formatter(f);
  LearnedHandlebars.registerHelper(str, function(context, options) {
    var args = Array.prototype.slice.call(arguments);
    return fn.apply(this, args);
  });
}

LearnedHandlebars.registerListHelper = function(str) {
  LearnedHandlebars.registerHelper(str, function(context, options) {
    return partial(str) + " " + list(context);
  });
}

LearnedHandlebars.preprocess = function(str, sync) {
  /*
  sync = sync || true;
  //preprocess {{import src}} statements
  var queue;
  var matches = str.match("{{import %}}").filterUnique();
  matches.forEach({
    ajax -> done {
      replace occurrences with text;
    }
    queue.push(ajax);
  });
  queue.done = return this;
  */
}

LearnedHandlebars.reverse = function(template) { return LearnedHandlebars.reverseParse(template.match(/{{((#|\/|@)?[\w\s_.]+)}}/g), { }); }

LearnedHandlebars.reverseParse = function(matches, obj, context) {

  obj = obj || { }, context = context || {root: obj};
  //if / character, break
    while(matches.length > 0) {
      var split = matches.shift().replace(/{{|}}/g, "").split(" ");

      var first = split[0], key = split[1], match;

      if (first[0] === '#') {

        var newContext = {name: first.substring(1), root: context.root},
            newObj = { };

        var str = LearnedHandlebars.helperType(newContext.name);

        if(typeof str === 'undefined' || str === 'none') return root.context;

        else if (str === 'single') obj[key] = obj[key] || "";

        else if (str === 'array') obj[key] = [newObj];

        else obj[key] = newObj;

        LearnedHandlebars.reverseParse(matches, newObj, newContext);

    } else if (_.has(LearnedHandlebars.helpers, first)) {

        var str = LearnedHandlebars.helperType(first);

        if(typeof str === 'undefined' || str === 'none') return root.context;

        else if (str === 'single') obj[key] = obj[key] || "";

        else if (str === 'array') obj[key] = [{ }];

        else obj[key] = { };


    } else if (first[0] === '@') {
      if (first.indexOf("@root.") === 0) {

        var keyPath = first.substring(6),
            paths = keyPath.split("."),
            outer = context.root;

        _.forEach(paths, function(path, index) {
          if(index == paths.length-1) {
            outer[path] = outer[path] || '';
          } else if (typeof outer[path] === 'string') {
            outer[path] = { };
          } else outer[path] = outer[path] || { };

          outer = outer[path];
        });
      }
    } else if (first[0] === '/' && context.name == first.substring(1)) {
      return context.root;
    } else if (first === 'this') {
      return context.root;
    } else obj[first] = "";
  }


  return context.root;

}
// Export helpers
for (var helper in helpers) {
  if (helpers.hasOwnProperty(helper)) {
      LearnedHandlebars.registerHelper(helper, helpers[helper]);
  }
}
module.exports = LearnedHandlebars;

//console.log(yaml("test.yml"));
