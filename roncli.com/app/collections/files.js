var File = require("../models/file"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: File,
    url: "/file"
});

module.exports.id = "Files";
