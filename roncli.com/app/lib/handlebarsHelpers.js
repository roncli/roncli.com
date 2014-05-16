module.exports = function(Handlebars) {
    "use strict";

    return {
        year: function() {
            return new Date().getFullYear();
        }
    };
};
