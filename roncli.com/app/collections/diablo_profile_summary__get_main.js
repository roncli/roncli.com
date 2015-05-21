var Summary = require("../models/diablo_profile_summary"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Summary,
    url: "/diablo-profile/get-main"
});

module.exports.id = "DiabloProfileSummary_GetMain";
