var Song = require("../models/song"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Song,
    url: "/project/get-featured"
});

module.exports.id = "Project_GetFeatured";
