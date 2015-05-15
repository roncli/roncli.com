var Model = require("./base");

module.exports = Model.extend({
    url: "/dcl-pilot/get-latest",
    idAttribute: "name"
});

module.exports.id = "DclPilot_GetLatest";
