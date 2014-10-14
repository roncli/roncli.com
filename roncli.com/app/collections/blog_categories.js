var Category = require("../models/blog_category"),
    Collection = require("rendr/shared/base/collection");

module.exports = Collection.extend({
    model: Category,
    url: "/blog-category"
});

module.exports.id = "BlogCategories";
