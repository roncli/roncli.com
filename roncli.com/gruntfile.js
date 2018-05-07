var fs = require("fs"),
    path = require("path"),
    remapify = require("remapify"),
    pjson = require("./package.json"),
    minifier = require("html-minifier"),

    /**
     * Minify HTML content
     * @param {string} content The content to minify.
     * @returns {string} The minified content.
     */
    minifyHtml = function(content) {
        "use strict";

        return minifier.minify(content, {
            removeComments: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        });
    },
    browserifyMainAliases = ["./node_modules/handlebars/runtime.js:handlebars", "rendr/shared/base/view"],
    browserifyAdminExternals = ["jquery", "./node_modules/handlebars/runtime.js:handlebars", "rendr/shared/base/view", "app/collections/base", "app/models/base", "app/lib/handleServerError"];

    /**
     * Setup project configuration.
     * @param {object} grunt The grunt object.
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
                    namespace: "default",
                    commonjs: true,
                    processContent: minifyHtml,

                    /**
                     * Returns the require path for the file.
                     * @param {string} filename The filename of the template to process.
                     * @returns {string} The require path for the file.
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
                 * @param {string} filepath The filename to filter.
                 * @returns {bool} Returns true if the filename does not contain two underscores.
                 */
                filter: function(filepath) {
                    return path.basename(filepath).slice(0, 2) !== "__";
                }
            },

            compile_admin_templates: {
                options: {
                    namespace: "default",
                    commonjs: true,
                    processContent: minifyHtml,

                    /**
                     * Returns the require path for the file.
                     * @param {string} filename The filename of the template to process.
                     * @returns {string} The require path for the file.
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
                    alias: browserifyMainAliases,
                    require: Object.keys(pjson.browser),
                    preBundleCB: function(b) {
                        b.on("remapify:files", function(file, expandedAliases) {
                            Object.keys(expandedAliases).forEach(function(key) {
                                if (key.indexOf(".js") === -1 && key.indexOf("\\") === -1 && (expandedAliases[key].indexOf("index.js") === -1 || key.indexOf("index") !== -1)) {
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
                    external: browserifyAdminExternals,
                    preBundleCB: function(b) {
                        b.on("remapify:files", function(file, expandedAliases) {
                            Object.keys(expandedAliases).forEach(function(key) {
                                if (key.indexOf(".js") === -1 && key.indexOf("\\") === -1 && (expandedAliases[key].indexOf("index.js") === -1 || key.indexOf("index") !== -1)) {
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
                    "assets/css/app.css": ["assets/css/bootstrap.css", "assets/css/bootstrap-theme.css", "assets/css/*.css", "!assets/css/app.css", "!assets/css/tinymce.css"]
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
                    "public/js/site.min.js": ["assets/js/site.js", "assets/js/loadJQuery.js", "assets/js/publicConfig.js", "assets/js/jquery-defaultButton-1.2.0.min.js", "assets/js/jquery-getParam.min.js"],
                    "public/js/admin.min.js": ["assets/js/admin.js"]
                }
            }
        },

        // Setup grunt-execute to run the application.
        execute: {
            target: {
                src: ["index.js"]
            }
        },

        // Deployments.
        copy: {
            "deploy-to-dev": {
                expand: true,
                src: ["./**"],
                dest: "c:\\inetpub\\roncli.com - dev"
            },
            deploy: {
                expand: true,
                src: ["./**"],
                dest: "c:\\inetpub\\roncli.com"
            }
        }
    });

    // Load NPM tasks.
    grunt.loadNpmTasks("grunt-contrib-handlebars");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-execute");
    grunt.loadNpmTasks("grunt-contrib-copy");

    // Ensure the browserify task runs with the correct location for backbone.
    grunt.registerTask("preBrowserify", function() {
        var done = this.async();

        fs.stat("./node_modules/rendr/node_modules/backbone", function(err) {
            if (err) {
                browserifyMainAliases.push("backbone:rendr/node_modules/backbone");
                browserifyAdminExternals.push("backbone:rendr/node_modules/backbone");
            } else {
                browserifyMainAliases.push("rendr/node_modules/backbone");
                browserifyAdminExternals.push("rendr/node_modules/backbone");
            }

            done();
        });
    });
    grunt.task.run("preBrowserify");

    // Register tasks.
    grunt.registerTask("compile", ["handlebars", "browserify", "cssmin", "uglify"]);
    grunt.registerTask("run", ["execute"]);
    grunt.registerTask("dev-deploy", ["compile", "copy:deploy-to-dev"]);
    grunt.registerTask("deploy", ["compile", "copy:deploy"]);
    grunt.registerTask("all", ["compile", "run"]);
    grunt.registerTask("noop", []);
    grunt.registerTask("default", ["compile"]);
};
