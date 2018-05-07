var DataAdapter = require("rendr/server/data_adapter"),
    fs = require("fs"),
    util = require("util");

/**
 * Creates an instance of the API Data Adapter.
 * @constructor
 */
function ApiDataAdapter() {
    "use strict";

    DataAdapter.call(this);
}

// Inherit all of the methods from DataAdapter.
util.inherits(ApiDataAdapter, DataAdapter);

/**
 * Override the request function with our own.
 * @param {object} req The Express request object.
 * @param {object} api The parsed path.
 * @param {object|Function} options Options to pass through.
 * @param {function} [callback] The function to callback when complete.
 */
ApiDataAdapter.prototype.request = function(req, api, options, callback) {
    "use strict";

    // Split up the path and get the filename.
    var path = api.path.split("/"),
        file = path[1],
        filename = "./api/" + file + ".js";

    if (callback === undefined) {
        callback = options;
        options = {};
    }

    // Default the response to return JSON with a 200.
    req.res.set("content-type", "application/json; charset=utf-8").status(200);

    // Check to ensure the API being requested exists.
    fs.exists(filename.replace(".", __dirname), function(exists) {
        var script, method;

        if (exists) {
            // Check to ensure the method on the API exists.
            script = require(filename);
            method = api.method.toLowerCase();

            if (typeof script[method] === "function") {
                // Call the API.
                req.parsedPath = path.slice(2);

                script[method](req, api.query, function(json) {
                    callback(null, req.res, json);
                });
            } else {
                // Return a 405 when the method is not allowed.
                req.res.status(405);
                callback(null, req.res, {error: "API method not allowed."});
            }
        } else {
            // Return a 404 when the API is not found.
            req.res.status(404);
            callback(null, req.res, {error: "API not found."});
        }
    });
};

module.exports = ApiDataAdapter;
