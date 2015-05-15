var Model = require("./base");

module.exports = Model.extend({
    url: "/diablo-profile/get-main",
    idAttribute: "name"
});

module.exports.id = "DiabloProfile_GetMain";
