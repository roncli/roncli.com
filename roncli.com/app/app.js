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

        // Call base function.
        BaseApp.prototype.start.call(this);
    }
});
