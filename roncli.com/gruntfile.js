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
                        return minifier.minify(content, {
                            removeComments: true,
                            collapseWhitespace: true,
                            conservativeCollapse: true,
                            minifyJS: true,
                            minifyCSS: true
                        });
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
                    "public/js/mergedAssets.js": ["app/**/*.js"]
                }
            }
        },

        // Setup cssmin to send CSS assets to the client.
        cssmin: {
            combine: {
                files: {
                    "assets/css/mergedAssets.css": ["assets/css/*.css", "!assets/css/mergedAssets.css"]
                }
            },
            minify: {
                expand: true,
                cwd: "assets/css/",
                src: ["mergedAssets.css"],
                dest: "public/css/",
                ext: ".min.css"
            }
        }
    });

    // Load handlebars, browserify, and cssmin.
    grunt.loadNpmTasks("grunt-contrib-handlebars");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");

    // Compile handlebars, browserify, and cssmin.
    grunt.registerTask("compile", ["handlebars", "browserify", "cssmin"]);

    // Default tasks.
    grunt.registerTask("default", ["compile"]);
};