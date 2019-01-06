var fs = require("fs");

/**
 * Process request for an RSS feed.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 */
module.exports = function(req, res) {
    "use strict";

    var filename = "." + req.params["0"] + ".js";

    // Default the response to return RSS+XML with a 200.
    res.set("content-type", "application/rss+xml; charset=utf-8").status(200);

    // Check to ensure the RSS being requested exists.
    fs.exists(filename.replace(".", __dirname), function(exists) {
        var script;

        if (exists) {
            // Check to ensure the method on the API exists.
            script = require(filename);

            if (typeof(script.rss) === "function") {
                try {
                    script.rss(req, res, function(xml) {
                        res.send(xml);
                    });
                } catch (err) {
                    try {
                        console.log("Unknown server error.");
                        console.log(err);
                        console.log(err.stack);
                        res.status(500);
                        res.json({error: "Unknown server error."});
                    } catch (err2) {
                        console.log("Error sending 500.");
                        console.log(err2);
                    }
                }
            } else {
                // Return a 404 when the RSS is not found.
                res.status(404);
                res.json({error: "RSS feed not found."});
            }
        } else {
            // Return a 404 when the RSS is not found.
            res.status(404);
            res.json({error: "RSS feed not found."});
        }
    });
};
