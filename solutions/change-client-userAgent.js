/******************************************************************************
*                                                                             *
* Someone on the mailing list asked a question about changing a single        *
* property on `window.navigator` (`userAgent`, in this case) without having   *
* to do a lot of work to set all of the other properties.                     *
*                                                                             *
* Created on:    2013-05-30                                                   *
* Last updated:  2013-05-30                                                   *
* Created for:                                                                *
*   https://groups.google.com/d/topic/phantomjs/K9onzelfgy4/discussion        *
*                                                                             *
******************************************************************************/

var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onInitialized = function() {
  page.evaluate(function() {
    var newNavigator = Object.create(window.navigator);
    newNavigator.userAgent = "blah";
    window.navigator = newNavigator;
  });
};

page.open("http://www.google.com/", function(status) {
  if (status !== "success") {
    console.error("Failed to load page: " + page.url);
    phantom.exit(1);
  }
  else {
    page.evaluate(function() {
      for (var prop in window.navigator) {
        console.log("window.navigator." + prop + " --> " + JSON.stringify(window.navigator[prop]));
      }
    });
    phantom.exit(0);
  }
});
