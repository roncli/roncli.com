var config = require("../privateConfig").blizzhub,
    Api = require("blizzhub/lib/api").API,
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,

    cacheToken = function(callback) {
        var api = new Api(config.clientId, config.clientSecret, function(status, token) {
            if (!status || !token) {
                callback(new Error("Failed getting a new Battle.Net access token."));
                return;
            }

            callback(null, token);
        });
    };

/**
 * Gets the token from cache, or retrieves a new one from Battle.Net and caches it.
 * @param {function} callback The callback function.
 */
module.exports.getToken = function(callback) {
    "use strict";

    var deferred = new Deferred();

    cache.keys("roncli.com:blizzhub:token", function(keys) {
        if (keys && keys.length > 0) {
            cache.get("roncli.com:blizzhub:token", function(token) {
                if (token) {
                    deferred.resolve(token);
                    return;
                }

                cacheToken(function(err, newToken) {
                    if (err) {
                        deferred.reject(err);
                        return;
                    }

                    deferred.resolve(newToken);
                });
            });
            return;
        }

        cacheToken(function(err, newToken) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(newToken);
        });
    });

    deferred.promise.then(function(token) {
        callback(null, token);
    },
    
    function(err) {
        console.log("Bad response from Battle.Net while getting a new access token.");
        console.log(err);

        callback({
            error: "Bad response from Battle.Net.",
            status: 200
        });
    });
};
