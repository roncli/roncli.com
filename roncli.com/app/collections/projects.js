var Project = require("../models/project"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Project,
    url: "/project"
});

module.exports.id = "Projects";
