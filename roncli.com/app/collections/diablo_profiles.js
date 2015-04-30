var Profile = require("../models/diablo_profile"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Profile,
    url: "/diablo-profile"
});

module.exports.id = "DiabloProfiles";
