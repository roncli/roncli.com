var http = require("http"),
    cache = require("../cache/cache"),

    /**
     * Caches the DCL pilot.
     * @param callback The callback function.
     */
    cachePilot = function(callback) {
        "use strict";

        http.get("http://descentchampions.org/pilot_data.php?uid=114", function(res) {
            var body = "";

            res.on("data", function(data) {
                body += data;
            });
            res.on("end", function() {
                var pilot;

                try {
                    pilot = JSON.parse(body);
                } catch (err) {
                    console.log("Bad response from DCL while retrieving pilot.");
                    console.log(err);
                    callback({
                        error: "Bad response from DCL.",
                        status: 200
                    });
                    return;
                }

                // Fix dates
                pilot.matches.forEach(function(match) {
                    match.date = new Date(match.date).toISOString();
                });

                cache.set("roncli.com:dcl:pilot", pilot, 86400, function() {
                    callback();
                });
            });
        }).on("error", function(err) {
            console.log("Error while retrieving pilot from DCL.");
            console.log(err);
            callback({
                error: "Bad response from DCL.",
                status: 200
            });
        });
    };

/**
 * Ensures that the DCL pilot is cached.
 * @param {boolean} force Forces the caching of the DCL pilot.
 * @param {function} callback The callback function.
 */
module.exports.cachePilot = function(force, callback) {
    "use strict";

    if (force) {
        cachePilot(callback);
        return;
    }

    cache.keys("roncli.com:dcl:pilot", function(keys) {
        if (keys && keys > 0) {
            callback();
            return;
        }

        cachePilot(callback);
    });
};
