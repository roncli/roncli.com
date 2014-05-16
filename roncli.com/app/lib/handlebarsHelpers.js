/**
 * Helpers for handlebars rendering.
 * @param {object} Handlebars The Handlebars object.
 * @returns {object} The helper functions to use with Handlebars.
 */
module.exports = function(Handlebars) {
    "use strict";

    return {
        /**
         * Returns the current year.
         * @returns {number} The current year.
         */
        year: function() {
            return new Date().getFullYear();
        },

        debug: function(value) {
            console.log("Current Context:", this);
            if (value) {
                console.log("Value:", value);
            }
        }
    };
};
