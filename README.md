[![Build Status](https://travis-ci.org/JamesMGreene/phantomjs-solutions.png)](https://travis-ci.org/JamesMGreene/phantomjs-solutions)

# phantomjs-solutions

A collection of the more interesting PhantomJS scripts that I've created as
workarounds for various users on the mailing list and issue tracker.



## [chain-loader.js](https://github.com/JamesMGreene/phantomjs-solutions/blob/master/solutions/chain-loader.js)

The latest PhantomJS (1.9.1 as of the time of writing this documentation)
will "hang" (i.e. not exit automatically) if it encounters a parse error
(syntax error) in the script it is executing unless the user has defined an
appropriate `phantom.onError` handler to catch all unhandled exceptions and
forcibly exit.  While adding the `phantom.onError` handler is ALWAYS the
best practice, some users would prefer that PhantomJS exit automatically
in its default `phantom.onError` handler so that they do not have to define
their own `phantom.onError` handler in every PhantomJS script they create.
While their desired behavior does make sense and mimics the behavior of
similar engines (e.g. Node.js), I proposed a chain-loading script to serve
as a workaround (perhaps temporarily, perhaps permanently).

This script sets up an appropriate `phantom.onError` handler and then
executes the target script specified as the first arg to the chain-loader
script, including adjusting all of the `phantom` and `system` values to
behave as if the target script had been the one executed from the shell
rather than the chain-loader script.

 - **Created for:**  &nbsp; &nbsp; &nbsp; https://github.com/ariya/phantomjs/issues/10687
 - **Created on:** &nbsp; &nbsp; &nbsp; 2013-05-23
 - **Last updated:** &nbsp;&nbsp; 2013-06-20



## [onLine-status.js](https://github.com/JamesMGreene/phantomjs-solutions/blob/master/solutions/onLine-status.js)

The latest PhantomJS (1.9.1 as of the time of writing this documentation)
does not yet realistically support the `window.navigator.onLine` status,
nor its associated `online` and `offline` events. As a temporary workaround
for testing purposes, I proposed a script that overrides the pertinent
`window.navigator` properties and event dispatching. Unfortunately, the
only way to control this behavior is by exposing a new globally accessible
function; in this script, it is called: `_change_onLine`.

 - **Created for:**  &nbsp; &nbsp; &nbsp; https://github.com/ariya/phantomjs/issues/10647
 - **Created on:** &nbsp; &nbsp; &nbsp; 2013-06-19
 - **Last updated:** &nbsp;&nbsp; 2013-06-19


