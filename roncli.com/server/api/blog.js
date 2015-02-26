var blog = require("../models/blog");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "getLatest":
                    blog.getLatestPost(function(err, post) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(post);
                    });
                    return;
                case "getFromUrl":
                    blog.getPostByUrl(query.url, function(err, post) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(post);
                    });
                    return;
            }
            break;
        case 2:
            switch (req.parsedPath[0]) {
                case "getLatestByCategory":
                    blog.getLatestPostByCategory(decodeURIComponent(req.parsedPath[1]), function(err, post) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(post);
                    });
                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
