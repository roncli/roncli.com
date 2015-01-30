var AdminPage = require("../models/admin__page"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: AdminPage,
    url: "/admin/pages"
});

module.exports.id = "Admin_Pages";
