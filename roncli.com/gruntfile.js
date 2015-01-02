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
            compile_main_templates: {
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
            combine_main_js_files: {
                options: {
                    require: Object.keys(pjson.browser),
                    preBundleCB: function(b) {
                        b.plugin(remapify,
                            {
                                cwd: "./app",
                                src: "**/*.js",
                                expose: "app"
                            }
                        );
                        b.on("remapify:files", function(file, expandedAliases) {
                            Object.keys(expandedAliases).forEach(function(key) {
                                if (key.indexOf(".js") === -1 && key.indexOf("\\") === -1) {
                                    b.require(expandedAliases[key], {expose: key});
                                }
                            });
                        });
                    }
                },
                files: {
                    "assets/js/site.js": ["app/**/*.js"]
                }
            }
        },

        // Setup cssmin to send CSS assets to the client.
        cssmin: {
            combine_main_css_files: {
                files: {
                    "assets/css/app.css": ["assets/css/bootstrap-theme.css", "assets/css/*.css", "!assets/css/app.css", "!assets/css/tinymce.css"]
                }
            },
            minify_main_css_files: {
                expand: true,
                cwd: "assets/css/",
                src: ["app.css"],
                dest: "public/css/",
                ext: ".min.css"
            }
        },

        // Setup uglify to send JS assets to the client.
        uglify: {
            minify_main_js_files: {
                options: {
                    preserveComments: false
                },
                files: {
                    "public/js/site.min.js": ["assets/js/site.js", "assets/js/loadJQuery.js", "assets/js/jquery-defaultButton-1.2.0.min.js", "assets/js/jquery-getParam.min.js"],
                }
            }
        }
    });

    // Load handlebars, browserify, cssmin, and uglify.
    grunt.loadNpmTasks("grunt-contrib-handlebars");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    // Compile handlebars, browserify, and cssmin.
    grunt.registerTask("compile", ["handlebars", "browserify", "cssmin", "uglify"]);

    // Noop task.
    grunt.registerTask("noop", []);

    // Default tasks.
    grunt.registerTask("default", ["compile"]);
};