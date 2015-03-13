var Model = require("./base");

module.exports = Model.extend({
    url: "/warcraft-feed/get-latest"
});

module.exports.id = "WarcraftFeed_GetLatest";
