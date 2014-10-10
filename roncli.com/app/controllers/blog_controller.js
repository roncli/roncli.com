module.exports = {
    /**
     * The blog page view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var data = {
            blog: {model: "Blog_GetLatest", params: {}}
        };

        this.app.fetch(data, function(err, result) {
            callback(err, result);
        });
    },

    url: function(params, callback) {
        "use strict";

        var data = {
            blog: {model: "Blog_GetFromUrl", params: {url: params[0]}}
        };

        this.app.fetch(data, function(err, result) {
            callback(err, result);
        });
    }
};
