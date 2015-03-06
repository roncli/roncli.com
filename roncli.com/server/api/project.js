var coding = require("../models/coding");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            if (query.url && query.url.length > 0) {
                coding.getProject(query.url, function(err, project) {
                    if (err) {
                        req.res.status(err.status);
                        callback(err);
                        return;
                    }
                    callback(project);
                });
            } else {
                coding.getProjects(function(err, projects) {
                    if (err) {
                        req.res.status(err.status);
                        callback(err);
                        return;
                    }
                    callback(projects);
                });
            }
            return;
        case 1:
            switch (req.parsedPath[0]) {
                case "get-featured":
                    if (!/^[1-9][0-9]*$/.test(query.count)) {
                        req.res.status(400);
                        callback({error: "Count must be a positive integer."});
                        return;
                    }

                    coding.getFeaturedProjects(+query.count, function(err, projects) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(projects);
                    });
                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
