module.exports = {
    /**
     * The default admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        callback(null);
    },

    /**
     * The blog admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    blog: function(params, callback) {
        "use strict";

        callback(null);
    }
};
