var Project = require("../models/project"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Project,
    url: "/project/get-featured"
});

module.exports.id = "Project_GetFeatured";
