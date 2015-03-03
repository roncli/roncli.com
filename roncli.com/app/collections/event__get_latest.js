var Event = require("../models/event"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Event,
    url: "/event/get-latest"
});

module.exports.id = "Event_GetLatest";
