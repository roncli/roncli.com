var cache = require("../cache/cache"),
    Rss = require("rss"),
    blog = require("../models/blog");

/**
 * Get the RSS feed for the blog.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.rss = function(req, res, callback) {
    "use strict";

    var startIndex = req.query["start-index"] || 1,
        category = req.query["category"],
        cacheKey = "roncli.com:rss:blog:" + startIndex + (category ? ":" + category : ""),
        feed = new Rss();

    cache.get(cacheKey, function(rss) {
        if (rss) {
            callback(null, rss);
            return;
        }

        feed.title = "roncli.com Blog";
        feed.description = "The blog of roncli";
        feed.generator = "roncli.com";
        feed.feed_url = "http://roncli.com/blog.rss";
        feed.site_url = "http://roncli.com/blog";
        feed.image_url = "http://roncli.com/images/roncliSmall.png";
        feed.managingEditor = "roncli@roncli.com (Ronald M. Clifford)";
        feed.webMaster = "roncli@roncli.com (Ronald M. Clifford)";
        feed.copyright = (new Date()).getFullYear().toString() + " Ronald M. Clifford";
        feed.language = "en-us";
        // feed.categories
        feed.ttl = 60;
        feed.custom_namespaces.openSearch = "http://a9.com/-/spec/opensearchrss/1.0/";
        feed.custom_namespaces.thr = "http://purl.org/syndication/thread/1.0";
        // feed.custom_elements.push({"openSearch:totalResults": ""});
        feed.custom_elements.push({"openSearch:startIndex": startIndex.toString()});
        feed.custom_elements.push({"openSearch:itemsPerPage": "25"});
    });


};
