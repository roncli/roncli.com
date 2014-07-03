var path = require("path"),
    remapify = require("remapify");

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
                    debug: true,
                    alias: ["node_modules/rendr-handlebars/index.js:rendr-handlebars"],
                    preBundleCB: function(b) {
                        b.plugin(remapify, [
                            {
                                src: "**/*.js",
                                expose: "app",
                                cwd: "app",
                                config: {verbose: true}
                            }
                        ]);
                    },
                    shim: {
                        jquery: {
                            path: "node_modules/jquery/dist/cdn/jquery-2.1.1.min.js",
                            exports: "$"
                        },
                        iscroll: {
                            path: "node_modules/iscroll/build/iscroll.js",
                            exports: "IScroll"
                        },
                        moment: {
                            path: "node_modules/moment/min/moment.min.js",
                            exports: "moment"
                        }
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