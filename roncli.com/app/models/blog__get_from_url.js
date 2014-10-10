var Model = require("./base");

module.exports = Model.extend({
    // TODO: This is a workaround until Rendr lets us pass the URL as a querystring.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
    url: "/blog/getFromUrl/:url",
    idAttribute: "url"
});

module.exports.id = "Blog_GetFromUrl";
