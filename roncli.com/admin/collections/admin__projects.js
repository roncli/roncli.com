var Project = require("../models/admin__project"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: Project,
    url: "/admin/coding/projects"
});

module.exports.id = "Admin_Projects";
