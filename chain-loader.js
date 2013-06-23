/******************************************************************************
*                                       *
* The latest PhantomJS (1.9.1 as of the time of writing this documentation)   *
* will "hang" (i.e. not exit automatically) if it encounters a parse error  *
* (syntax error) in the script it is executing unless the user has defined an *
* appropriate `phantom.onError` handler to catch all unhandled exceptions and *
* forcibly exit.  While adding the `phantom.onError` handler is ALWAYS the  *
* best practice, some users would prefer that PhantomJS exit automatically  *
* in its default `phantom.onError` handler so that they do not have to define *
* their own `phantom.onError` handler in every PhantomJS script they create.  *
* While their desired behavior does make sense and mimics the behavior of   *
* similar engines (e.g. Node.js), I proposed a chain-loading script to serve  *
* as a workaround (perhaps temporarily, perhaps permanently).         *
*                                       *
* This script sets up an approrpriate `phantom.onError` handler and then    *
* executes the target script specified as the first arg to the chain-loader   *
* script, including adjusting all of the `phantom` and `system` values to   *
* behave as if the target script had been the one executed from the shell   *
* rather than the chain-loader script.                    *
*                                       *
* Created on:  2013-05-23                           *
* Last updated:  2013-06-20                           *
* Created for:   https://github.com/ariya/phantomjs/issues/10687        *
*                                       *
******************************************************************************/

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

var wrappedWindow = (function() {
  var system = require('system'),
    fs = require('fs'),
    realScriptPath;

  //
  // Execute some minimal input validation before jumping into the deep end
  //
  if (system.args.length < 1) {
    throw new Error("No script was provided to execute with PhantomJS!");
  }

  realScriptPath = fs.absolute(system.args[0]);
  if (!fs.exists(realScriptPath)) {
    throw new Error("The script provided to execute with PhantomJS does not exist!");
  }
  if (!fs.isFile(realScriptPath)) {
    throw new Error("The script provided to execute with PhantomJS is not a file!");
  }
  if (!fs.isReadable(realScriptPath)) {
    throw new Error("The script provided to execute with PhantomJS is not readable!");
  }


  //
  // Create a bunch of overridden derivative objects using the originals as prototypes
  //
  var p = Object.create(phantom);
  Object.defineProperty(p, 'scriptName', {
    value: system.args[1].replace(/\\/g, '/').split('/').slice(-1)[0],
    enumerable: true
  });
  Object.defineProperty(p, 'libraryPath', {
    value: require('fs').absolute(system.args[1].replace(/\\/g, '/').split('/').slice(0, -1).join('/')),
    enumerable: true
  });
  Object.defineProperty(p, 'args', {
    value: system.args.slice(2),
    enumerable: true
  });

  var s = Object.create(system);
  Object.defineProperty(s, 'args', {
    value: system.args.slice(1),
    enumerable: true
  });

  var r = (function(require) {
    return function(moduleId) {
      if (moduleId === 'system') {
        return s;
      }
      return require(moduleId);
    };
  })(require);

  var w = Object.create(window);
  Object.defineProperty(w, 'phantom', {
    value: p,
    enumerable: true
  });
  w.require = r;
  return w;
})();

/*
console.log('OUTER!');
console.log(' - phantom.scriptName: ' + JSON.stringify(phantom.scriptName));
console.log(' - phantom.libraryPath: ' + JSON.stringify(phantom.libraryPath));
console.log(' - phantom.args: ' + JSON.stringify(phantom.args));
console.log(' - system.scriptName: ' + JSON.stringify(require('system').args));
*/

// Now run the real code
(function(window, require, phantom) {
  /*
  console.log('INNER!');
  console.log(' - phantom.scriptName: ' + JSON.stringify(phantom.scriptName));
  console.log(' - phantom.libraryPath: ' + JSON.stringify(phantom.libraryPath));
  console.log(' - phantom.args: ' + JSON.stringify(phantom.args));
  console.log(' - system.scriptName: ' + JSON.stringify(require('system').args));
  */

  phantom.injectJs(require('system').args[0]);

}).call(wrappedWindow, wrappedWindow, wrappedWindow.require, wrappedWindow.phantom);