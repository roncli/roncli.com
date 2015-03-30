var fs = require("fs"),
    path = require("path"),
    config = require("../privateConfig").files,
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all;

/**
 * Gets the files.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getFiles = function(callback) {
    "use strict";

    fs.readdir(config.path, function(err, files) {
        var ls = [], promises = [];

        if (err) {
            console.log("File system error while reading the directory in admin.getFiles.");
            console.log(err);
            callback({
                error: "There was a server error while getting the files.  Please reload the page and try again.",
                status: 500
            });
            return;
        }

        if (files.length === 0) {
            callback(null, []);
            return;
        }

        files.forEach(function(file) {
            promises.push(
                (function() {
                    var deferred = new Deferred();

                    fs.stat(path.join(config.path, file), function(err, stats) {
                        if (err) {
                            console.log("File system error while reading a file in admin.getFiles.");
                            console.log(err);
                            deferred.reject({
                                error: "There was a server error while getting the files.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        if (stats.isFile()) {
                            ls.push({
                                file: file,
                                size: stats.size,
                                created: stats.ctime.getTime(),
                                modified: stats.mtime.getTime()
                            });
                        }

                        deferred.resolve(true);
                    });

                    return deferred.promise;
                }())
            );
        });

        all(promises).then(
            function() {
                callback(null, ls.sort(function(a, b) {
                    return a.file.toLowerCase().localeCompare(b.file.toLowerCase());
                }));
            },

            function(err) {
                callback(err);
            }
        );
    });
};
