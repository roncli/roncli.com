var BaseApp = require("rendr/shared/app"),
    handlebarsHelpers = require("./lib/handlebarsHelpers"),
    $ = require("jquery");

// Extend the BaseApp class, adding any custom methods or overrides.
module.exports = BaseApp.extend({

    /**
     * Client and server initialization function.
     */
    initialize: function() {
        "use strict";

        // Register our Handlebars helpers.
        this.templateAdapter.registerHelpers(handlebarsHelpers);
    },

    /**
     * Client-only initialization functions.
     */
    start: function() {
        "use strict";

        var IScroll = require("iscroll");

        // Get the tweets.
        var _this = this,
            scroller,
            loadTweets = function() {
                var data = {
                    tweets: {collection: "Tweets"}
                };

                _this.fetch(data, function(err, results) {
                    var html = _this.templateAdapter.getTemplate("site/tweet")(results.tweets);
                    $("div.tweets").html(html);
                    if (scroller) {
                        setTimeout(function() {
                            scroller.refresh();
                        }, 0);
                    } else {
                        scroller = new IScroll(".wrapper", {mouseWheel: true, scrollbars: true, snap: "div.tweet"});
                    }
                });
            };
        loadTweets();
        setInterval(loadTweets, 900000);

        // Call base function.
        BaseApp.prototype.start.call(this);
    }
});
