var file = require("../models/file");

module.exports.get = function(req, query, callback) {
    "use strict";

    file.getFiles(function(err, data) {
        if (err) {
            req.res.status(err.status);
            callback(err);
            return;
        }

        callback(data);
    });
};
