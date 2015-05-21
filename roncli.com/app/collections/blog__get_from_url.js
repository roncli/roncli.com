var Blog = require("../models/blog"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Blog,
    url: "/blog/getFromUrl"
});

module.exports.id = "Blog_GetFromUrl";
