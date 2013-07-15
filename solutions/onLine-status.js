/******************************************************************************
*                                                                             *
* The latest PhantomJS (1.9.1 as of the time of writing this documentation)   *
* does not yet realistically support the `window.navigator.onLine` status,    *
* nor its associated `online` and `offline` events. As a temporary workaround *
* for testing purposes, I proposed a script that overrides the pertinent      *
* `window.navigator` properties and event dispatching. Unfortunately, the     *
* only way to control this behavior is by exposing a new globally accessible  *
* function; in this script, it is called: `_change_onLine`.                   *
*                                                                             *
* Created on:    2013-06-19                                                   *
* Last updated:  2013-06-19                                                   *
* Created for:   https://github.com/ariya/phantomjs/issues/10647              *
*                                                                             *
******************************************************************************/

var page = require('webpage').create();

page.onInitialized = function() {
  page.evaluate(function() {
    (function(window) {
      // This variable is private via closure.
      // Set the value to `false` to start in an "offline" state.
      var _onlineStatus = true;

      // This function is private via closure.
      // Dispatch the "online"/"offline" events as appropriate.
      var _fireStatusEvent = function(onLine) {
        var eventType = onLine !== false ? "online" : "offline";
        var event = document.createEvent('Event');
        event.initEvent(eventType, true, false);

        // Dispatch on `body`, bubbles up to `document`, then `window`.
        window.document.body.dispatchEvent(event);
      };

      // This function is public on the `window` object but is immutable.
      // Alter the value of `window.navigator.onLine`.
      Object.defineProperty(window, '_change_onLine', {
        value: function(status) {
          if (typeof status === 'boolean' && status !== _onlineStatus) {
            _onlineStatus = status;
            _fireStatusEvent(status);
          }
        }
      });

      // Override the `window.navigator` object.
      // This is ONLY possible from the `WebPage#onInitialized` callback.
      window.navigator = (function(oldNav) {
        var newNav = Object.create(oldNav);
        Object.defineProperty(newNav, 'onLine', {
          get: function() {
            return _onlineStatus;
          },
          set: function(value) {
            // This is the setter behavior I'm seeing in Chrome...
            return value === _onlineStatus;
          },
          enumerable: true
        });
        return newNav;
      }(window.navigator));
    }(window));
  });
};

page.onConsoleMessage = function(msg) {
  console.log("Message from " + page.url + ":\n  " + msg);
};

page.open("http://www.google.com", function(status) {
  page.evaluate(function() {
    // Set up some normal event handlers if they aren't already on the page.
    var statusListener = function(e) {
      var eventType = (e && e.type) || "load";
      var status = window.navigator.onLine;
      console.log("[" + eventType + "] Connected to network: " + status);
    };
    window.addEventListener("offline", statusListener, false);
    window.addEventListener("online", statusListener, false);

    // Manually invoke the handler once just to trigger the output.
    statusListener();

    // Go offline!
    window._change_onLine(false);

    // Go online!
    window._change_onLine(true);
  });
  phantom.exit(0);
});


/********************
* Resulting output: *
********************/
/*
Message from http://www.google.com/:
  [load] Connected to network: true
Message from http://www.google.com/:
  [offline] Connected to network: false
Message from http://www.google.com/:
  [online] Connected to network: true
*/
