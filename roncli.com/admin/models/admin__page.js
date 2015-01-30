var Model = require("app/models/base");

module.exports = Model.extend({
    // TODO: This is a workaround until Rendr lets us pass the URL as a querystring.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
    url: "/admin/page/:url"
});

module.exports.id = "Admin_Page";
