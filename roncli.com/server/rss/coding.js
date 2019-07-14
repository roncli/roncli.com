var cache = require("../cache/cache"),
    Rss = require("rss"),
    coding = require("../models/coding"),
    moment = require("moment"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all;

/**
 * Get the RSS feed for the coding section.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.rss = function(req, res, callback) {
    "use strict";

    var startIndex = +req.query["start-index"] || 1,
        cacheKey = "roncli.com:rss:coding:" + startIndex,
        feed = new Rss();

    cache.get(cacheKey, function(xml) {
        if (xml) {
            callback(xml);
            return;
        }

        feed.title = "roncli.com Coding";
        feed.description = "Commits and releases for roncli's projects.";
        feed.generator = "roncli.com";
        feed.feed_url = "https://roncli.com/coding.rss";
        feed.site_url = "https://roncli.com/coding";
        feed.image_url = "https://roncli.com/images/roncliSmall.png";
        feed.managingEditor = "roncli@roncli.com (Ronald M. Clifford)";
        feed.webMaster = "roncli@roncli.com (Ronald M. Clifford)";
        feed.copyright = (new Date()).getFullYear().toString() + " Ronald M. Clifford";
        feed.language = "en-us";
        feed.ttl = 60;
        feed.custom_namespaces.openSearch = "http://a9.com/-/spec/opensearchrss/1.0/";
        feed.custom_elements.push({"openSearch:startIndex": startIndex.toString()});
        feed.custom_elements.push({"openSearch:itemsPerPage": "25"});

        // Get the latest events.
        coding.getLatestEvents(0, function(err, events) {
            var base = "https://roncli.com/coding.rss",
                count, lastStart;

            if (err) {
                res.status(err.status);
                callback({error: err.error});
                return;
            }

            feed.categories = ["commit", "release"];

            count = events.length;
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

            events.slice(startIndex, startIndex + 25).forEach(function(event) {
                var title;

                switch (event.type) {
                    case "push":
                        title = event.message;

                        if (title.length > 50) {
                            title = title.substring(0, 47) + "...";
                        }

                        title = event.repository + " - " + title;
                        break;
                    case "release":
                        title = event.repository + " Release: " + event.release;
                        break;
                }

                feed.item({
                    guid: "roncli.com:coding:" + event.type + ":" + event.id.toString(),
                    date: new Date(event.published),
                    categories: [event.type],
                    title: title,
                    description: event.message,
                    url: "https://roncli.com/coding",
                    author: "roncli@roncli.com (roncli)",
                    custom_elements: [
                        {"atom:updated": moment(new Date(event.published)).format()}
                    ]
                });
            });

            xml = feed.xml();

            cache.set(cacheKey, xml, 900);

            callback(xml);
        });
    });
};
