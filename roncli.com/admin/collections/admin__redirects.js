var Redirect = require("../models/admin__redirect"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: Redirect,
    url: "/admin/redirect"
});

module.exports.id = "Admin_Redirects";
