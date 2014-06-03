var handlebars = require("handlebars"),
    fs = require("fs"),
    path = require("path"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,
    _ = require("underscore"),
    cachedTemplates = {};

handlebars.registerHelper("escapeQuotes", function(text) {
    "use strict";

    return text.replace(/"/g, "\\\"");
});

/**
 * Retrieves templates.
 * @param {string[]} templates The array pf template to retrieve.
 * @param {function} callback The callback function.
 */
module.exports.get = function(templates, callback) {
    "use strict";

    var promises = [],
        templateFunctions = {},
        getTemplate = function(template) {
            var deferred, filename;

            if (cachedTemplates[template]) {
                templateFunctions[template] = cachedTemplates[template];
                return true;
            }

            deferred = new Deferred();
            filename = path.join(__dirname, template) + ".hbs";

            fs.exists(filename, function(exists) {
                if (!exists) {
                    console.log("Missing template in template.get: " + filename);
                    deferred.reject({
                        error: "There was an error retrieving a template.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                fs.readFile(filename, {encoding: "utf8"}, function(err, data) {
                    if (err) {
                        console.log("Error reading file in template.get: " + filename);
                        console.log(err);
                        deferred.reject({
                            error: "There was an error retrieving a template.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    cachedTemplates[template] = handlebars.compile(data);
                    templateFunctions[template] = cachedTemplates[template];
                    deferred.resolve(true);
                });
            });

            return deferred.promise;
        };

    _(templates).each(function(value) {
        promises.push(getTemplate(value));
    });

    all(promises).then(
        function() {
            callback(null, templateFunctions);
        },
        function(err) {
            callback(err);
        }
    );
};
