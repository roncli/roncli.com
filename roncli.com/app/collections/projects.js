var Song = require("../models/song"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Song,
    url: "/project"
});

module.exports.id = "Projects";
