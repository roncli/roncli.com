var Model = require("./base");

module.exports = Model.extend({
    url: "/blog/getLatest",
    idAttribute: "blogUrl"
});

module.exports.id = "Blog_GetLatest";
