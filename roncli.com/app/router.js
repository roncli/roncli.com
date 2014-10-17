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
    this.on("action:end", this.actionEnd, this);
};

Router.prototype.actionStart = function() {
    "use strict";

    var scroller;

    // Destroy page scrollers.
    while (this.app.pageScrollers.length > 0) {
        scroller = this.app.pageScrollers.pop();
        scroller.destroy();
        scroller = null;
    }
};

/**
 * Performs actions on end of a page.
 */
Router.prototype.actionEnd = function() {
    "use strict";

    var sharing = $("div.panel-body.sharing");

    // Update abbreviations.
    $("abbr.setTime").timeago().removeClass("setTime");

    // Update sharing URLs.
    sharing.find("a.facebook-share").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href));
    sharing.find("a.twitter-share").attr("href", "https://twitter.com/home?status=" + encodeURIComponent(window.location.href));
    sharing.find("a.gplus-share").attr("href", "https://plus.google.com/share?url=" + encodeURIComponent(window.location.href));
    sharing.find("a.tumblr-share").attr("href", "http://www.tumblr.com/share/link?url=" + encodeURIComponent(window.location.href));

    // Tracks a page view with Google Analytics.
    if (window._gaq) {
        _gaq.push(["_trackPageview"]);
    }
};
