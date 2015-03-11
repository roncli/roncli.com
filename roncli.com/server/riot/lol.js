var config = require("../privateConfig").riot,
    lol = require("lolapi")(config.apikey, "na"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,
    tiers = ["CHALLENGER", "MASTER", "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"],
    divisions = ["I", "II", "III", "IV", "V"],

    /**
     * Caches the ranked info from Riot.
     * @param {function} callback The callback function.
     */
    cacheRanked = function(callback) {
        "use strict";

        all(
            (function() {
                var deferred = new Deferred();

                lol.League.getEntriesBySummonerId(40501037, function(err, leagues) {
                    var league;

                    if (err) {
                        console.log("Bad response from Riot while getting the leagues.");
                        console.log(err);
                        deferred.reject({
                            error: "Bad response from Riot.",
                            status: 502
                        });
                        return;
                    }

                    league = leagues[40501037].sort(function(a, b) {
                        if (tiers.indexOf(a.tier) > tiers.indexOf(b.tier)) {
                            return 1;
                        }
                        if (tiers.indexOf(a.tier) < tiers.indexOf(b.tier)) {
                            return -1;
                        }
                        return divisions.indexOf(a.entries[0].division) - divisions.indexOf(b.entries[0].division);
                    })[0];

                    cache.set("roncli.com:riot:lol:league", league, 86400, function() {
                        deferred.resolve(true);
                    });
                });

                return deferred.promise;
            }()),

            (function() {
                var deferred = new Deferred(),
                    history = [],
                    getHistory = function(start) {
                        lol.MatchHistory.getBySummonerId(40501037, {
                            rankedQueues: ["RANKED_SOLO_5x5", "RANKED_TEAM_3x3", "RANKED_TEAM_5x5"],
                            beginIndex: start,
                            endIndex: start + 15
                        }, function(err, matches) {
                            if (err) {
                                console.log("Bad response from Riot while getting the match history.");
                                console.log(err);
                                deferred.reject({
                                    error: "Bad response from Riot.",
                                    status: 502
                                });
                                return;
                            }

                            if (matches && matches.matches) {
                                history = [].concat.apply([], [history, matches.matches]);
                                if (matches.matches.length >= 15) {
                                    getHistory(start + 15);
                                    return;
                                }
                            }

                            cache.del(["roncli.com:riot:lol:history"], function() {
                                cache.zadd("roncli.com:riot:lol:history", history.map(function(match) {
                                    return {
                                        score: match.matchCreation,
                                        value: match
                                    };
                                }), 86400, function() {
                                    deferred.resolve(true);
                                });
                            });
                        });
                    };

                getHistory(0);

                return deferred.promise;
            }())
        ).then(
            function() {
                callback();
            },

            function(err) {
                callback(err);
            }
        );
    };

// TODO: Set limit to application's limits for live.
lol.setRateLimit(10, 500);

/**
 * Ensures that the ranked info is cached.
 * @param {boolean} force Forces the caching of the ranked info.
 * @param {function} callback The callback function.
 */
module.exports.cacheRanked = function(force, callback) {
    "use strict";

    if (force) {
        cacheRanked(callback);
        return;
    }

    cache.keys("roncli.com:riot:lol:league", function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheRanked(callback);
    });
};
