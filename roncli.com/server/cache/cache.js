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
 * @param {function} callback= The optional callback function.
 */
module.exports.set = function(key, value, expiration, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
            }
            return;
        }

        client.set(key, JSON.stringify(value), "EX", expiration, function(err) {
            client.end();

            if (err) {
                console.log("Error setting cache using set", key, value);
                console.log(err);
            }

            if (typeof callback === "function") {
                callback();
            }
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
                console.log("Error retrieving cache using get", key);
                console.log(err);
                callback();
                return;
            }

            callback(JSON.parse(data));
        });
    });
};

/**
 * Adds an item to a sorted set in the cache.
 * @param {string} key The key to add to a sorted set in the cache.
 * @param {{value: object, score: number}[]} valueScorePairs An array of objects contaning a value and a score.
 * @param {number} expiration The expiration in seconds.
 * @param {function} callback= The optional callback function.
 */
module.exports.zadd = function(key, valueScorePairs, expiration, callback) {
    "use strict";

    login(function(err, client) {
        var values;

        if (err) {
            if (typeof callback === "function") {
                callback();
            }
            return;
        }

        values = [key];

        valueScorePairs.forEach(function(pair) {
            values.push(pair.score, JSON.stringify(pair.value));
        });

        client.zadd(values, function(err) {
            client.end();

            if (err) {
                console.log("Error setting cache using zadd", key, valueScorePairs);
                console.log(err);
            }

            client.expire(key, expiration);

            if (typeof callback === "function") {
                callback();
            }
        });
    });
};

/**
 * Retrieves items from a sorted set in the cache.
 * @param {string} key The key to get the sorted set from in the cache.
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {function} callback The callback function.
 */
module.exports.zrange = function(key, start, end, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            callback();
            return;
        }

        client.zrange(key, start, end, function(err, data) {
            client.end();

            if (err) {
                console.log("Error getting cache using zrange", key, start, end);
                console.log(err);
                callback();
                return;
            }

            callback(data.map(function(item) {
                return JSON.parse(item);
            }));
        });
    });
};

/**
 * Retrieves items from a sorted set in the cache in reverse order.
 * @param {string} key The key to get the sorted set from in the cache.
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {function} callback The callback function.
 */
module.exports.zrevrange = function(key, start, end, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            callback();
            return;
        }

        client.zrevrange(key, start, end, function(err, data) {
            client.end();

            if (err) {
                console.log("Error getting cache using zrevrange", key, start, end);
                console.log(err);
                callback();
                return;
            }

            callback(data.map(function(item) {
                return JSON.parse(item);
            }));
        });
    });
};
