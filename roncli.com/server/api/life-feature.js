var page = require("../models/page");

module.exports.get = function(req, query, callback) {
    "use strict";

    page.getLifeFeatures(function(err, data) {
        if (err) {
            req.res.status(err.status);
            callback(err);
            return;
        }

        callback(data);
    });
};
