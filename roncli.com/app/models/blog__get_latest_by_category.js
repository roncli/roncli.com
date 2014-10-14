var Model = require("./base");

module.exports = Model.extend({
    url: "/blog/getLatestByCategory/:category",
    idAttribute: "category"
});

module.exports.id = "Blog_GetLatestByCategory";
