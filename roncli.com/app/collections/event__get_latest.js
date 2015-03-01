var Song = require("../models/song"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Song,
    url: "/event/get-latest"
});

module.exports.id = "Event_GetLatest";
