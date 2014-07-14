var path = require("path"),
    remapify = require("remapify"),
    pjson = require("./package.json"),
    minifier = require("html-minifier");

/**
 * Setup project configuration.
 * @param {object} grunt - The grunt object.
 */
module.exports = function(grunt) {
    "use strict";

    // Load the initial configuration.
    grunt.initConfig({
        // Read in the initial configuration.
        pkg: grunt.file.readJSON("package.json"),

        // Setup handlebars.
        handlebars: {
            compile: {
                options: {
                    namespace: false,
                    commonjs: true,

                    /**
                     * Returns the require path for the file.
                     * @param {string} filename - The filename of the template to process.
                     */
                    processName: function(filename) {
                        return filename.replace("app/templates/", "").replace(".hbs", "");
                    },

                    /**
                     * Minify HTML content
                     */
                    processContent: function(content, file) {
                        console.log();
                        console.log("===" + file.toUpperCase() + "===");
                        console.log("PREFORMATTED");
                        console.log(content);
                        content = minifier.minify(content, {
                            removeComments: true,
                            collapseWhitespace: true,
                            conservativeCollapse: true,
                            minifyJS: true,
                            minifyCSS: true
                        });
                        console.log();
                        console.log("===" + file.toUpperCase() + "===");
                        console.log("FORMATTED");
                        console.log(content);
                        return content;
                    }
                },
                files: {
                    "app/templates/compiledTemplates.js": ["app/templates/**/*.hbs"]
                },

                /**
                 * Exclude files that begin with two underscores.
                 * @param {string} filepath - The filename to filter.
                 */
                filter: function(filepath) {
                    return path.basename(filepath).slice(0, 2) !== "__";
                }
            }
        },

        // Setup browserify to send node assets to the client.
        browserify: {
            dist: {
                options: {
                    require: Object.keys(pjson.browser),
                    preBundleCB: function(b) {
                        b.plugin(remapify,
                            {
                                src: "**/*.js",
                                expose: "app",
                                cwd: "./app"
                            }
                        );
                        b.on("remapify:files", function(file, expandedAliases) {
                            Object.keys(expandedAliases).forEach(function(key) {
                                if (key.indexOf(".js") === -1) {
                                    b.require(expandedAliases[key], {expose: key});
                                }
                            });
                        });
                    }
                },
                files: {
                    "public/mergedAssets.js": ["app/**/*.js"]
                }
            }
        }
    });

    // Load Browserify and Handlebars compilers.
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-handlebars");

    // Compile handlebars and browserify.
    grunt.registerTask("compile", ["handlebars", "browserify"]);

    // Default tasks.
    grunt.registerTask("default", ["compile"]);
};