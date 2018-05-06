var config = require("../privateConfig").redis,
    redis = require("redis"),

    login = function(callback) {
        "use strict";

        var client = redis.createClient(config.port, config.host, config.options),
            errorCallback = function(err) {
                console.log("Error while connecting to redis");
                console.log(err);
                client.quit();
                if (typeof callback === "function") {
                    callback(err);
                    callback = null;
                }
            };

        client.auth(config.password, function(err) {
            if (err) {
                console.log("Error sending password");
                console.log(err);
                client.quit();
                if (typeof callback === "function") {
                    callback(err);
                    callback = null;
                }
                return;
            }

            client.removeListener("error", errorCallback);
            if (typeof callback === "function") {
                callback(null, client);
                callback = null;
            }
        });
        client.on("error", errorCallback);
    };

/**
 * Deletes keys from the cache.
 * @param {string[]} keys An array of keys.
 * @param {function} [callback] The optional callback function.
 */
module.exports.del = function(keys, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error deleting cache using del", keys);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.del(keys, function(err) {
            if (err) {
                console.log("Error deleting cache using del", keys);
                console.log(err);
            }

            client.quit();

            if (typeof callback === "function") {
                callback();
                callback = null;
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
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using get", key);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.get(key, function(err, data) {
            client.quit();

            if (err) {
                console.log("Error retrieving cache using get", key);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                callback(JSON.parse(data));
                callback = null;
            }
        });
    });
};

/**
 * Determines if a key exists in a hash in the cache.
 * @param {string} key The key to check in the cache.
 * @param {string} field The field to check in the hash.
 * @param {function} callback The callback function.
 */
module.exports.hexists = function(key, field, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            callback(false);
            callback = null;
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using hexists", key, field);
            console.log(err);
            client.quit();
            callback(false);
            callback = null;
        });

        client.hexists(key, field, function(err, data) {
            client.quit();

            if (err) {
                console.log("Error retrieving cache using hexists", key, field);
                console.log(err);
                callback(false);
                callback = null;
                return;
            }

            if (typeof callback === "function") {
                callback(data);
                callback = null;
            }
        });
    });
};

/**
 * Gets an item from a hash in the cache.
 * @param {string} key The key to get from the cache.
 * @param {string} field The field to get from the hash.
 * @param {function} callback The callback function.
 */
module.exports.hget = function(key, field, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using hget", key, field);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.hget(key, field, function(err, data) {
            client.quit();

            if (err) {
                console.log("Error retrieving cache using hget", key, field);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                callback(JSON.parse(data));
                callback = null;
            }
        });
    });
};

/**
 * Gets all items from a hash in the cache.
 * @param {string} key The key to get from the cache.
 * @param {function} callback The callback function.
 */
module.exports.hgetall = function(key, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using hgetall", key);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.hgetall(key, function(err, data) {
            var index;

            client.quit();

            if (err) {
                console.log("Error retrieving cache using hgetall", key);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                for (index in data) {
                    if (data.hasOwnProperty(index)) {
                        data[index] = JSON.parse(data[index]);
                    }
                }
                callback(data);
                callback = null;
            }
        });
    });
};

/**
 * Gets items from a hash in the cache.
 * @param {string} key The key to add to a hash in the cache.
 * @param {string[]} fields The fields to retrieve values from in the cache.
 * @param {function} [callback] The optional callback function.
 */
module.exports.hmget = function(key, fields, callback) {
    "use strict";

    login(function(err, client) {
        var values = [];

        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using hmget", key);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        values = [key].concat(fields);

        client.hmget(values, function(err, data) {
            var index;

            client.quit();

            if (err) {
                console.log("Error retrieving cache using hmget", key);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                for (index in data) {
                    if (data.hasOwnProperty(index)) {
                        data[index] = JSON.parse(data[index]);
                    }
                }
                callback(data);
                callback = null;
            }
        });
    });
};

/**
 * Adds items to a hash in the cache.
 * @param {string} key The key to add to a hash in the cache.
 * @param {{key: string, value: object}[]} keyValuePairs An array of objects contaning a key and a value.
 * @param {number} expiration The expiration in seconds.
 * @param {function} [callback] The optional callback function.
 */
module.exports.hmset = function(key, keyValuePairs, expiration, callback) {
    "use strict";

    login(function(err, client) {
        var values;

        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error setting cache using hmset", key, keyValuePairs);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        values = [key];

        keyValuePairs.forEach(function(pair) {
            values.push(pair.key, JSON.stringify(pair.value));
        });

        client.hmset(values, function(err) {
            if (err) {
                console.log("Error setting cache using hmset", key, keyValuePairs);
                console.log(err);
            } else {
                if (expiration > 0) {
                    client.expire(key, expiration);
                }
            }

            client.quit();

            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });
    });
};

/**
 * Returns the keys that match the input.
 * @param {string} key The key to search for.
 * @param {function} callback The callback function.
 */
module.exports.keys = function(key, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error getting cache using keys", key);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.keys(key, function(err, keys) {
            client.quit();

            if (err) {
                console.log("Error getting cache using keys", key);
                console.log(err);
                callback();
                return;
            }

            if (typeof callback === "function") {
                callback(keys);
                callback = null;
            }
        });
    });
};

/**
 * Sets an item in the cache.
 * @param {string} key The key to set in the cache.
 * @param {object} value The value to set in the cache.
 * @param {number} expiration The expiration in seconds.
 * @param {function} [callback] The optional callback function.
 */
module.exports.set = function(key, value, expiration, callback) {
    "use strict";

    login(function(err, client) {
        var parameters;

        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error setting cache using set", key, value);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        parameters = [key, JSON.stringify(value)];
        if (expiration > 0) {
            parameters.push("EX");
            parameters.push(expiration);
        }
        client.set(parameters, function(err) {
            client.quit();

            if (err) {
                console.log("Error setting cache using set", key, value);
                console.log(err);
            }

            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });
    });
};

/**
 * Adds items to a sorted set in the cache.
 * @param {string} key The key to add to a sorted set in the cache.
 * @param {{value: object, score: number}[]} valueScorePairs An array of objects contaning a value and a score.
 * @param {number} expiration The expiration in seconds.
 * @param {function} [callback] The optional callback function.
 */
module.exports.zadd = function(key, valueScorePairs, expiration, callback) {
    "use strict";

    login(function(err, client) {
        var values;

        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error setting cache using zadd", key, valueScorePairs);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        values = [key];

        valueScorePairs.forEach(function(pair) {
            values.push(pair.score, JSON.stringify(pair.value));
        });

        client.zadd(values, function(err) {
            if (err) {
                console.log("Error setting cache using zadd", key, valueScorePairs);
                console.log(err);
            }

            if (expiration > 0) {
                client.expire(key, expiration);
            }
            client.quit();

            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });
    });
};

/**
 * Retrieves the count of items from a sorted set in the cache.
 * @param {string} key The key to get the sorted set from in the cache.
 * @param {function} callback The callback function.
 */
module.exports.zcard = function(key, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using zcard", key);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.zcard(key, function(err, data) {
            client.quit();

            if (err) {
                console.log("Error retrieving cache using zcard", key);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                callback(data);
                callback = null;
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
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using zrange", key, start, end);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.zrange(key, start, end, function(err, data) {
            client.quit();

            if (err) {
                console.log("Error retrieving cache using zrange", key, start, end);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                callback(data.map(function(item) {
                    return JSON.parse(item);
                }));
                callback = null;
            }
        });
    });
};

/**
 * Returns the index of an item in a sorted set.
 * @param {string} key The key to remove from a sorted set in the cache.
 * @param {object[]} value The value to look for.
 * @param {function} [callback] The optional callback function.
 */
module.exports.zrank = function(key, value, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving index using zrank", key, value);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.zrank(key, JSON.stringify(value), function(err, index) {
            client.quit();

            if (err) {
                console.log("Error retrieving index using zrank", key, value);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                callback(index);
                callback = null;
            }
        });
    });
};

/**
 * Removes items from a sorted set in the cache.
 * @param {string} key The key to remove from a sorted set in the cache.
 * @param {object[]} values An array of objects contaning a values.
 * @param {function} [callback] The optional callback function.
 */
module.exports.zrem = function(key, values, callback) {
    "use strict";

    login(function(err, client) {
        var keys;

        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error updating cache using zrem", key, values);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        keys = [key];

        values.forEach(function(value) {
            keys.push(JSON.stringify(value));
        });

        client.zrem(keys, function(err) {
            client.quit();

            if (err) {
                console.log("Error updating cache using zrem", key, values);
                console.log(err);
            }

            if (typeof callback === "function") {
                callback();
                callback = null;
            }
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
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using zrevrange", key, start, end);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.zrevrange(key, start, end, function(err, data) {
            client.quit();

            if (err) {
                console.log("Error retrieving cache using zrevrange", key, start, end);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
                return;
            }

            if (typeof callback === "function") {
                callback(data.map(function(item) {
                    return JSON.parse(item);
                }));
                callback = null;
            }
        });
    });
};

/**
 * Retrieves the reverse rank of an item from a sorted set.
 * @param {string} key The key to get the sorted set from in the cache.
 * @param {object} value The value to search.
 * @param {function} callback The callback function.
 */
module.exports.zrevrank = function(key, value, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback();
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error retrieving cache using zrevrank", key, value);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        client.zrevrank(key, JSON.stringify(value), function(err, data) {
            client.quit();

            if (err) {
                console.log("Error retrieving cache using zrevrank", key, value);
                console.log(err);
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
            }

            if (typeof callback === "function") {
                callback(data);
                callback = null;
            }
        });
    });
};

/**
 * Stores the union of two sorted sets into a new sorted set.
 * @param {string} key The key to store the resulting set in.
 * @param {string[]} keys An array of keys to use.
 * @param {number} expiration The expiration in seconds.
 * @param {function} callback The callback function.
 */
module.exports.zunionstore = function(key, keys, expiration, callback) {
    "use strict";

    login(function(err, client) {
        if (err) {
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
            return;
        }

        client.on("error", function(err) {
            console.log("Error setting cache using zunionstore", key, keys);
            console.log(err);
            client.quit();
            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });

        keys.unshift(keys.length);
        keys.unshift(key);

        client.zunionstore(keys, function(err) {
            if (err) {
                console.log("Error setting cache using zunionstore", key, keys);
                console.log(err);
            } else {
                if (expiration > 0) {
                    client.expire(key, expiration);
                }
            }

            client.quit();

            if (typeof callback === "function") {
                callback();
                callback = null;
            }
        });
    });
};
