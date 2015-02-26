/**
 * A function to handle a server error in the controllers.
 * @param {object} err The error object.
 * @param {object} app The application object.
 * @param {object} result The result object.
 * @param {function} callback The callback function.
 */
module.exports = function(err, app, result, callback) {
    "use strict";

    if (err.status) {
        // This is a known error.
        if (app && app.req && app.req.res) {
            app.req.res.status(err.status);
        }

        if (err.status === 404) {
            callback(null, "error/404", result);
        } else {
            callback(null, "error/other", result);
        }
        return;
    }

    // This is an unknown error.
    if (app && app.req && app.req.res) {
        app.req.res.status(500);
    }
    callback(null, "error/other", result);
};
