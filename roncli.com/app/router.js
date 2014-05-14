var BaseClientRouter = require('rendr/client/router'),
    Router = module.exports = function Router(options) {
        "use strict";

        BaseClientRouter.call(this, options);
    };

// Set up inheritance on the router.
Router.prototype = Object.create(BaseClientRouter.prototype);
Router.prototype.constructor = BaseClientRouter;

/**
 * Records an impression whenever an action is started.
 */
Router.prototype.postInitialize = function() {
    "use strict";

    this.on('action:start', this.trackImpression, this);
};

/**
 * Tracks a page view with Google Analytics.
 */
Router.prototype.trackImpression = function() {
    "use strict";

    if (window._gaq) {
        _gaq.push(['_trackPageview']);
    }
};
