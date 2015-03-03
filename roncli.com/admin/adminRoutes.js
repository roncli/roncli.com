/**
 * The routes in use by the admin website.
 * @param {object} app The application.
 */
module.exports = function(app) {
    "use strict";

    // The main admin page.
    app.router.route(/^\/?admin$/, "admin#index");

    // The blog admin page.
    app.router.route(/^\/?admin\/blog$/, "admin#blog");

    // The pages admin page.
    app.router.route(/^\/?admin\/pages$/, "admin#pages");

    // The page admin page.
    app.router.route(/^\/?admin\/page(\/.*)$/, "admin#page");

    // The music admin page.
    app.router.route(/^\/?admin\/music$/, "admin#music");

    // The coding admin page.
    app.router.route(/^\/?admin\/coding$/, "admin#coding");

    // The project admin page.
    app.router.route(/^\/?admin\/project(\/.*)$/, "admin#project");
};
