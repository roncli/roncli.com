var config = require("../privateConfig").redis,
    redis = require("redis"),

    login = function(callback) {
        "use strict";

        var client = redis.createClient(config.port, config.host, config.options);
        client.auth(config.password, function(err) {
            if (err) {
                console.log("Error sending password");
                console.log(err);
                client.end();
                callback(err);
                return;
            }

            callback(null, client);
        });
    };

/**
 * Sets an item in the cache.
 * @param {string} key The key to set in the cache.
 * @param {object} value The value to set in the cache.
 * @param {number} expiration The expiration in seconds.
 */
module.exports.set = function(key, value, expiration) {
    "use strict";

    login(function(err, client) {
        if (err) {
            return;
        }

        client.set(key, JSON.stringify(value), "EX", expiration, function(err) {
            if (err) {
                console.log("Error saving cache", key, value);
                console.log(err);
            }
            client.end();
        });
    });
};

/**
 * Gets an item from the cache.
 * @param {string} key The key to get from the cache.
 * @param {function} callback The callback function.
 */
module.exports.get = function(key, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            callback();
            return;
        }

        client.get(key, function(err, data) {
            client.end();

            if (err) {
                console.log("Error retrieving cache", key);
                console.log(err);
                callback();
                return;
            }

            callback(JSON.parse(data));
        });
    });
};
