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
        }, callback);
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
            pages: {collection: "Admin_Pages", params: {}}
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
        }, {readFromCache: false, writeToCache: false}, callback);
    }
};
