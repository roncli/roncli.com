var Pilot = require("../models/dcl_pilot"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Pilot,
    url: "/dcl-pilot"
});

module.exports.id = "DclPilotData";
