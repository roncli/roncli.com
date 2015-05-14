var cache = require("../cache/cache"),
    Rss = require("rss"),
    gaming = require("../models/gaming"),
    youtube = require("../models/youtube"),
    crypto = require("crypto"),
    moment = require("moment"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all;

/**
 * Get the RSS feed for gaming.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.rss = function(req, res, callback) {
    "use strict";

    var startIndex = +req.query["start-index"] || 1,
        cacheKey = "roncli.com:rss:gaming:" + startIndex,
        feed = new Rss();


    cache.get(cacheKey, function(xml) {
        var rssDeferred, wowFeedDeferred, lolMatchesDeferred, dclMatchesDeferred, sixGamingDeferred, wowVideosDeferred, d3VideosDeferred, lolVideosDeferred, dclVideosDeferred;

        if (xml) {
            callback(xml);
            return;
        }

        feed.title = "roncli Gaming";
        feed.description = "The latest videos and gaming updates from roncli.";
        feed.generator = "roncli.com";
        feed.feed_url = "http://roncli.com/gaming.rss";
        feed.site_url = "http://roncli.com/gaming";
        feed.image_url = "http://roncli.com/images/roncliSmall.png";
        feed.managingEditor = "roncli@roncli.com (Ronald M. Clifford)";
        feed.webMaster = "roncli@roncli.com (Ronald M. Clifford)";
        feed.copyright = (new Date()).getFullYear().toString() + " Ronald M. Clifford";
        feed.language = "en-us";
        feed.ttl = 60;
        feed.custom_namespaces.openSearch = "http://a9.com/-/spec/opensearchrss/1.0/";
        feed.custom_elements.push({"openSearch:startIndex": startIndex.toString()});
        feed.custom_elements.push({"openSearch:itemsPerPage": "25"});
        feed.categories = ["World of Warcraft Feed", "League of Legends Ranked Matches", "Descent Champions Ladder Matches", "Six Gaming Podcast Highlights", "World of Warcraft Videos", "Diablo III Videos", "League of Legends Videos", "Descent Champions Ladder Videos"];

        // See if we have the items cached already.
        rssDeferred = new Deferred();

        cache.get("roncli.com:rss:gaming:feedItems", function(items) {
            if (items) {
                console.log("SERIOUS WTF");
                feed.items = items;
                rssDeferred.resolve();
                return;
            }

            wowFeedDeferred = new Deferred();
            lolMatchesDeferred = new Deferred();
            dclMatchesDeferred = new Deferred();
            sixGamingDeferred = new Deferred();
            wowVideosDeferred = new Deferred();
            d3VideosDeferred = new Deferred();
            lolVideosDeferred = new Deferred();
            dclVideosDeferred = new Deferred();

            // Get the WoW feed.
            gaming.getWowFeed(function(err, wowFeed) {
                if (err) {
                    wowFeedDeferred.reject(err);
                    return;
                }

                if (wowFeed && wowFeed.feedItems) {
                    wowFeed.feedItems.forEach(function(item) {
                        var sha = crypto.createHash("sha1"),
                            title, description;

                        switch (item.type) {
                            case "ACHIEVEMENT":
                                title = "World of Warcraft Achievement: " + item.title;
                                description = "Achieved " + item.title;
                                break;
                            case "BOSSKILL":
                                title = "World of Warcraft Boss Kill: " + item.boss;
                                description = "Defeated " + item.boss;
                                break;
                            case "LOOT":
                                title = "World of Warcraft Looted: " + item.item;
                                description = "Looted " + item.item;
                                break;
                        }

                        sha.update(JSON.stringify(item));

                        feed.item({
                            guid: "roncli.com:gaming:wowFeed:" + sha.digest("base64"),
                            date: new Date(item.timestamp),
                            categories: ["World of Warcraft Feed"],
                            title: title,
                            description: description,
                            url: "http://roncli.com/gaming",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(item.timestamp)).format()}
                            ]
                        });
                    });
                }

                wowFeedDeferred.resolve(true);
            });

            // Get LoL matches.
            gaming.getLolRanked(function(err, ranked) {
                if (err) {
                    lolMatchesDeferred.reject(err);
                    return;
                }

                if (ranked && ranked.games) {
                    ranked.games.forEach(function(match) {
                        var title = "League of Legends Ranked " + (match.winner ? "Win" : "Loss") + ": " + ranked.champions[match.championId].name + " " + match.matchDuration.minutes + ":" + match.matchDuration.seconds + " " + match.kills + "/" + match.deaths + "/" + match.assists + " " + match.cs + " CS",
                            description = (match.winner ? "Win" : "Loss") + " with " + ranked.champions[match.championId].name + "<br />" + match.matchDuration.minutes + ":" + match.matchDuration.seconds + "<br />" + match.kills + "/" + match.deaths + "/" + match.assists + " " + match.cs + " CS<br />" + match.goldPerMinute + " Gold per Minute";

                        feed.item({
                            guid: "roncli.com:gaming:lolRanked:" + match.matchId,
                            date: new Date(match.matchCreation),
                            categories: ["League of Legends Ranked Matches"],
                            title: title,
                            description: description,
                            url: "http://roncli.com/gaming",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(match.matchCreation)).format()}
                            ]
                        });
                    });
                }

                lolMatchesDeferred.resolve(true);
            });

            // Get DCL matches.
            gaming.getDclPilot(false, function(err, pilot) {
                if (err) {
                    dclMatchesDeferred.reject(err);
                    return;
                }

                if (pilot && pilot.matches) {
                    pilot.matches.forEach(function(match) {
                        var title = "Descent Champions League " + (match.pilot.score > match.opponent.score ? "Win: " + match.pilot.score + "-" + match.opponent.score : "Loss: " + match.opponent.score + "-" + match.pilot.score) + " vs. " + match.opponent.name + " in " + match.game + " " + match.map,
                            description = (match.pilot.score > match.opponent.score ? "Win - roncli " + match.pilot.score + " - " + match.opponent.name + " " + match.opponent.score : "Loss - " + match.opponent.name + " " + match.opponent.score + " - roncli " + match.pilot.score) + "<br />Played in " + match.game + " " + match.map;

                        feed.item({
                            guid: "roncli.com:gaming:dclMatch:" + match.match,
                            date: new Date(match.date),
                            categories: ["Descent Champions Ladder Matches"],
                            title: title,
                            description: description,
                            url: "http://roncli.com/gaming",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(match.date)).format()}
                            ]
                        });
                    });
                }
            });

            // Get Six Gaming highlight videos.
            youtube.getPlaylist("PLzcYb51h4me8-Jq9mOk6Vk1MLodmhRZ6K", function(err, playlist) {
                if (err) {
                    sixGamingDeferred.reject(err);
                    return;
                }

                if (playlist && playlist.videos) {
                    playlist.videos.forEach(function(video) {
                        feed.item({
                            guid: "roncli.com:gaming:sixGamingPodcast:" + video.id,
                            date: new Date(video.publishedAt),
                            categories: ["Six Gaming Podcast Highlights"],
                            title: video.title,
                            description: video.description,
                            url: "http://roncli.com/playlist/PLzcYb51h4me8-Jq9mOk6Vk1MLodmhRZ6K/six-gaming-podcast-highlights",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(video.publishedAt)).format()}
                            ]
                        });
                    });
                }

                sixGamingDeferred.resolve(true);
            });

            // Get WoW videos.
            youtube.getPlaylist("PLoqgd0t_KsN4SzIkVVyPVt7UuT3d6Rr7G", function(err, playlist) {
                if (err) {
                    wowVideosDeferred.reject(err);
                    return;
                }

                if (playlist && playlist.videos) {
                    playlist.videos.forEach(function(video) {
                        feed.item({
                            guid: "roncli.com:gaming:wowVideos:" + video.id,
                            date: new Date(video.publishedAt),
                            categories: ["World of Warcraft Videos"],
                            title: video.title,
                            description: video.description,
                            url: "http://roncli.com/playlist/PLoqgd0t_KsN4SzIkVVyPVt7UuT3d6Rr7G/gaming-world-of-warcraft",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(video.publishedAt)).format()}
                            ]
                        });
                    });
                }

                wowVideosDeferred.resolve(true);
            });

            // Get Diablo III videos.
            youtube.getPlaylist("PLoqgd0t_KsN7LEYsVepkfbn2xOiC5M5yY", function(err, playlist) {
                if (err) {
                    d3VideosDeferred.reject(err);
                    return;
                }

                if (playlist && playlist.videos) {
                    playlist.videos.forEach(function(video) {
                        feed.item({
                            guid: "roncli.com:gaming:d3Videos:" + video.id,
                            date: new Date(video.publishedAt),
                            categories: ["Diablo III Videos"],
                            title: video.title,
                            description: video.description,
                            url: "http://roncli.com/playlist/PLoqgd0t_KsN7LEYsVepkfbn2xOiC5M5yY/gaming-diablo-iii",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(video.publishedAt)).format()}
                            ]
                        });
                    });
                }

                d3VideosDeferred.resolve(true);
            });

            // Get LoL videos.
            youtube.getPlaylist("PLoqgd0t_KsN5YU7YGjhofQ7DJTt8pV4OZ", function(err, playlist) {
                if (err) {
                    lolVideosDeferred.reject(err);
                    return;
                }

                if (playlist && playlist.videos) {
                    playlist.videos.forEach(function(video) {
                        feed.item({
                            guid: "roncli.com:gaming:lolVideos:" + video.id,
                            date: new Date(video.publishedAt),
                            categories: ["League of Legends Videos"],
                            title: video.title,
                            description: video.description,
                            url: "http://roncli.com/playlist/PLoqgd0t_KsN5YU7YGjhofQ7DJTt8pV4OZ/gaming-league-of-legends",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(video.publishedAt)).format()}
                            ]
                        });
                    });
                }

                lolVideosDeferred.resolve(true);
            });

            // Get DCL videos.
            youtube.getPlaylist("PLoqgd0t_KsN5hXZPYr9GjcGrDaj3Uq2A-", function(err, playlist) {
                if (err) {
                    dclVideosDeferred.reject(err);
                    return;
                }

                if (playlist && playlist.videos) {
                    playlist.videos.forEach(function(video) {
                        feed.item({
                            guid: "roncli.com:gaming:dclVideos:" + video.id,
                            date: new Date(video.publishedAt),
                            categories: ["Descent Champions Ladder Videos"],
                            title: video.title,
                            description: video.description,
                            url: "http://roncli.com/playlist/PLoqgd0t_KsN5hXZPYr9GjcGrDaj3Uq2A-/gaming-descent-dcl",
                            author: "roncli@roncli.com (roncli)",
                            custom_elements: [
                                {"atom:updated": moment(new Date(video.publishedAt)).format()}
                            ]
                        });
                    });
                }

                dclVideosDeferred.resolve(true);
            });

            all([wowFeedDeferred.promise, lolMatchesDeferred.promise, sixGamingDeferred.promise, wowVideosDeferred.promise, d3VideosDeferred.promise, lolVideosDeferred.promise, dclVideosDeferred.promise]).then(
                function() {
                    // Sort items.
                    feed.items.sort(function(a, b) {
                        return b.date.getTime() - a.date.getTime();
                    });

                    // Cache the items.
                    cache.set("roncli.com:rss:gaming:feedItems", feed.items, 900);

                    rssDeferred.resolve();
                },

                // If any of the functions error out, it will be handled here.
                function(err) {
                    rssDeferred.reject(err);
                }
            );
        });

        rssDeferred.promise.then(
            function() {
                var count = feed.items.length,
                    base = "http://roncli.com/gaming.rss",
                    lastStart = Math.floor((count - 1) / 25) * 25 + 1;

                feed.custom_elements.push({"openSearch:totalResults": count});
                if (startIndex !== 1) {
                    feed.custom_elements.push({"link": {_attr: {rel: "first", href: base}}});
                }
                if (startIndex !== lastStart) {
                    feed.custom_elements.push({"link": {_attr: {rel: "last", href: base + "?start-index=" + lastStart}}});
                }
                if (startIndex >= 26) {
                    feed.custom_elements.push({"link": {_attr: {rel: "previous", href: base + "?start-index=" + (startIndex - 25)}}});
                }
                if (startIndex <= lastStart - 25) {
                    feed.custom_elements.push({"link": {_attr: {rel: "next", href: base + "?start-index=" + (startIndex + 25)}}});
                }

                feed.items = feed.items.slice(startIndex - 1, startIndex + 24);

                xml = feed.xml();

                cache.set(cacheKey, xml, 900);

                callback(xml);
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                res.status(err.status);
                callback({error: err.error});
            }
        );
    });
};