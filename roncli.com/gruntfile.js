var path = require("path");

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
                src: "app/templates/**/*.hbs",
                dest: "app/templates/compiledTemplates.js",

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
            options: {
                debug: true,
                alias: ["node_modules/rendr-handlebars/index.js:rendr-handlebars"],
                aliasMappings: [
                    {
                        cwd: "app/",
                        src: ["**/*.js"],
                        dest: "app/"
                    }
                ],
                shim: {
                    jquery: {
                        path: "node_modules/jquery/dist/jquery.min.js",
                        exports: "$"
                    }
                }
            },
            app: {
                src: ["app/**/*.js"],
                dest: "public/mergedAssets.js"
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