var File = require("../models/admin__file"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: File,
    url: "/admin/coding/files"
});

module.exports.id = "Admin_Files";
