var Category = require("../models/blog_category"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Category,
    url: "/blog-category"
});

module.exports.id = "BlogCategories";
