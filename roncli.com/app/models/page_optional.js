var Model = require("./base");

module.exports = Model.extend({
    // TODO: This is a workaround until Rendr lets us pass the URL as a querystring.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
    url: "/page-optional/:url"
});

module.exports.id = "PageOptional";
