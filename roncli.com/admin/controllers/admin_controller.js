module.exports = {
    /**
     * The default admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        this.app.fetch({
            notifications: {model: "User_GetNotifications", params: {}}
        }, {readFromCache: false, writeToCache: false}, callback);
    },

    /**
     * The blog admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    blog: function(params, callback) {
        "use strict";

        this.app.fetch({
            comments: {collection: "Admin_BlogComments", params: {}}
        }, {readFromCache: false, writeToCache: false}, callback);
    },

    /**
     * The pages admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    pages: function(params, callback) {
        "use strict";

        this.app.fetch({
            pages: {model: "Admin_Pages", params: {}},
            comments: {collection: "Admin_PageComments", params: {}}
        }, {readFromCache: false, writeToCache: false}, callback);
    },

    /**
     * The page admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    page: function(params, callback) {
        "use strict";

        this.app.fetch({
            page: {model: "Admin_Page", params: {url: params[0]}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (result) {
                result.url = params[0];
            }
            callback(err, result);
        });
    }
};
