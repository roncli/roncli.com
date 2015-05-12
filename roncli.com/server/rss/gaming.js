var cache = require("../cache/cache"),
    Rss = require("rss"),
    gaming = require("../models/gaming"),
    youtube = require("../models/youtube"),
    crypto = require("cyrpto"),
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
        feed = new Rss();

    cache.get("roncli.com:rss:gaming", function(xml) {
        var wowFeedDeferred, lolMatchesDeferred, sixGamingDeferred, wowVideosDeferred, d3VideosDeferred, lolVideosDeferred, dclVideosDeferred;

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
        feed.categories = ["World of Warcraft Feed", "League of Legends Ranked Matches", "Six Gaming Podcast Highlights", "World of Warcraft Videos", "Diablo III Videos", "League of Legends Videos", "Descent Champions Ladder Videos"];

        wowFeedDeferred = new Deferred();
        lolMatchesDeferred = new Deferred();
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
                            title = "Achievement: " + item.title;
                            description = "Achieved " + item.title;
                            break;
                        case "BOSSKILL":
                            title = "Boss Kill: " + item.boss;
                            description = "Defeated " + item.boss;
                            break;
                        case "LOOT":
                            title = "Looted: " + item.item;
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
        });

        // Get LoL matches.
        gaming.getLolRanked(function(err, ranked) {
            if (err) {
                lolMatchesDeferred.reject(err);
                return;
            }
        });

        // Get Six Gaming highlight videos.
        youtube.getPlaylist("PLzcYb51h4me8-Jq9mOk6Vk1MLodmhRZ6K", function(err, playlist) {
            if (err) {
                sixGamingDeferred.reject(err);
                return;
            }
        });

        // Get WoW videos.
        youtube.getPlaylist("PLoqgd0t_KsN4SzIkVVyPVt7UuT3d6Rr7G", function(err, playlist) {
            if (err) {
                wowVideosDeferred.reject(err);
                return;
            }
        });

        // Get Diablo III videos.
        youtube.getPlaylist("PLoqgd0t_KsN7LEYsVepkfbn2xOiC5M5yY", function(err, playlist) {
            if (err) {
                d3VideosDeferred.reject(err);
                return;
            }
        });

        // Get LoL videos.
        youtube.getPlaylist("PLoqgd0t_KsN5YU7YGjhofQ7DJTt8pV4OZ", function(err, playlist) {
            if (err) {
                lolVideosDeferred.reject(err);
                return;
            }
        });

        // Get DCL videos.
        youtube.getPlaylist("PLoqgd0t_KsN5hXZPYr9GjcGrDaj3Uq2A-", function(err, playlist) {
            if (err) {
                dclVideosDeferred.reject(err);
                return;
            }
        });

    });
};