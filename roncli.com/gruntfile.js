var path = require("path"),
    remapify = require("remapify"),
    pjson = require("./package.json"),
    minifier = require("html-minifier"),

    /**
     * Minify HTML content
     */
    minifyHtml = function(content, file) {
        "use strict";

        return minifier.minify(content, {
            removeComments: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        });
    };

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
                    processContent: minifyHtml,

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
            },

            compile_admin_templates: {
                options: {
                    namespace: false,
                    commonjs: true,
                    processContent: minifyHtml,

                    /**
                     * Returns the require path for the file.
                     * @param {string} filename - The filename of the template to process.
                     */
                    processName: function(filename) {
                        return filename.replace("admin/templates/", "").replace(".hbs", "");
                    }
                },
                files: {
                    "admin/templates/adminTemplates.js": ["admin/templates/**/*.hbs"]
                }
            }
        },

        // Setup browserify to send node assets to the client.
        browserify: {
            combine_main_js_files: {
                options: {
                    alias: ["rendr/shared/base/view"],
                    require: Object.keys(pjson.browser),
                    preBundleCB: function(b) {
                        b.on("remapify:files", function(file, expandedAliases) {
                            Object.keys(expandedAliases).forEach(function(key) {
                                if (key.indexOf(".js") === -1 && key.indexOf("\\") === -1) {
                                    b.require(path.resolve(expandedAliases[key]), {expose: key});
                                }
                            });
                        });
                        b.plugin(remapify, {
                            cwd: "./app",
                            src: "**/*.js",
                            expose: "app"
                        });
                    }
                },
                files: {
                    "assets/js/site.js": ["app/**/*.js"]
                }
            },

            combine_admin_js_files: {
                options: {
                    external: ["jquery", "rendr/shared/base/view"],
                    preBundleCB: function(b) {
                        b.on("remapify:files", function(file, expandedAliases) {
                            Object.keys(expandedAliases).forEach(function(key) {
                                if (key.indexOf(".js") === -1 && key.indexOf("\\") === -1) {
                                    b.require(path.resolve(expandedAliases[key]), {expose: key});
                                }
                            });
                        });
                        b.plugin(remapify, {
                            cwd: "./admin",
                            src: "**/*.js",
                            expose: "app"
                        });
                    }
                },
                files: {
                    "assets/js/admin.js": ["admin/**/*.js"]
                }
            }
        },

        // Setup cssmin to send CSS assets to the client.
        cssmin: {
            combine_main_css_files: {
                options: {
                    report: "gzip"
                },
                files: {
                    "assets/css/app.css": ["assets/css/bootstrap-theme.css", "assets/css/*.css", "!assets/css/app.css", "!assets/css/tinymce.css"]
                }
            },
            minify_main_css_files: {
                options: {
                    report: "gzip"
                },
                expand: true,
                cwd: "assets/css/",
                src: ["app.css"],
                dest: "public/css/",
                ext: ".min.css"
            },
            minify_tinymce_css_file: {
                expand: true,
                cwd: "assets/css",
                src: ["tinymce.css"],
                dest: "public/css",
                ext: ".min.css"
            }
        },

        // Setup uglify to send JS assets to the client.
        uglify: {
            minify_main_js_files: {
                options: {
                    preserveComments: false,
                    report: "gzip"
                },
                files: {
                    "public/js/site.min.js": ["assets/js/site.js", "assets/js/loadJQuery.js", "assets/js/jquery-defaultButton-1.2.0.min.js", "assets/js/jquery-getParam.min.js"],
                    "public/js/admin.min.js": ["assets/js/admin.js"]
                }
            }
        },

        // Setup grunt-execute to run the application.
        execute: {
            target: {
                src: ["index.js"]
            }
        }
    });

    // Load NPM tasks.
    grunt.loadNpmTasks("grunt-contrib-handlebars");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-execute");

    // Register tasks.
    grunt.registerTask("compile", ["handlebars", "browserify", "cssmin", "uglify"]);
    grunt.registerTask("run", ["execute"]);
    grunt.registerTask("all", ["compile", "run"]);
    grunt.registerTask("noop", []);
    grunt.registerTask("default", ["compile"]);
};
