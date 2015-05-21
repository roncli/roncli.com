var Summary = require("../models/dcl_pilot_summary"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Summary,
    url: "/dcl-pilot/get-latest"
});

module.exports.id = "DclPilotSummary_GetLatest";
