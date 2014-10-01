module.exports = {
    /**
     * The default home view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var data = {
            time: {model: "Time", params: {}},
            blog: {model: "Blog_GetLatest", params: {}}
        };

        this.app.fetch(data, function(err, result) {
            callback(err, result);
        });
    }
};
