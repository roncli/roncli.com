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

        // Setup grunt-execute to run the application.
        execute: {
            target: {
                src: ["index.js"]
            }
        },

        // Deployments.
        copy: {
            deploy: {
                expand: true,
                src: ["./**"],
                dest: "c:\\inetpub\\ronc.li"
            }
        }
    });

    // Load NPM tasks.
    grunt.loadNpmTasks("grunt-execute");
    grunt.loadNpmTasks("grunt-contrib-copy");

    // Register tasks.
    grunt.registerTask("run", ["execute"]);
    grunt.registerTask("deploy", ["copy:deploy"]);
    grunt.registerTask("all", ["run"]);
    grunt.registerTask("noop", []);
    grunt.registerTask("default", ["noop"]);
};
