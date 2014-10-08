/*global _gaq*/
var BaseClientRouter = require("rendr/client/router"),
    $ = require("jquery"),
    Router;

module.exports = function (options) {
    "use strict";

    BaseClientRouter.call(this, options);
};

Router = module.exports;

// Set up inheritance on the router.
Router.prototype = Object.create(BaseClientRouter.prototype);
Router.prototype.constructor = BaseClientRouter;

/**
 * Records an impression whenever an action is started.
 */
Router.prototype.postInitialize = function() {
    "use strict";

    this.on("action:start", this.actionStart, this);
};

/**
 * Performs actions on start of a page.
 */
Router.prototype.actionStart = function() {
    "use strict";

    // Update abbreviations.
    $("abbr.setTime").timeago().removeClass("setTime");

    // Tracks a page view with Google Analytics.
    if (window._gaq) {
        _gaq.push(["_trackPageview"]);
    }
};
