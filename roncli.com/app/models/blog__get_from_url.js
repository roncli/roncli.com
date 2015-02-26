var Model = require("./base");

module.exports = Model.extend({
    url: "/blog/getFromUrl",
    idAttribute: "blogUrl"
});

module.exports.id = "Blog_GetFromUrl";
