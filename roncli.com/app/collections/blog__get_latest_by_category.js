var Blog = require("../models/blog"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Blog,
    url: "/blog/getLatestByCategory/:category"
});

module.exports.id = "Blog_GetLatestByCategory";
