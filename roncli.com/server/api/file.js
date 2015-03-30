var file = require("../models/file"),
    handleError = require("../handleError");

module.exports.get = function(req, query, callback) {
    "use strict";

    file.getFiles(function(err, data) {
        if (err) {
            handleError(err, req);
            callback(err);
            return;
        }

        req.res.status(200);
        callback(data);
    });
};
