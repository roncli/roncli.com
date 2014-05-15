var BaseApp = require('rendr/shared/app'),
    handlebarsHelpers = require('./lib/handlebarsHelpers');

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

        // Show a loading indicator when the app is fetching.
        this.router.on('action:start', function() {
            this.set({loading: true});
        }, this);
        this.router.on('action:end', function() {
            this.set({loading: false});
        }, this);

        // Call base function.
        BaseApp.prototype.start.call(this);
    },

    /**
     * Client-only setting of the app view.
     */
    getAppViewClass: function() {
        "use strict";

        return require("./views/app_view");
    }
});
