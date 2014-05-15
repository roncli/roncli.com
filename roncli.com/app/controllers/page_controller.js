module.exports = {
    /**
     * The default page view.
     * @param {object} params - The parameters to use in the controller.
     * @param {function((null | object), string, object=)} callback - The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        callback(null, "page");
    }
};
