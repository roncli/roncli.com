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

    // The files admin page.
    app.router.route(/^\/?admin\/files$/, "admin#files");

    // The music admin page.
    app.router.route(/^\/?admin\/music$/, "admin#music");

    // The coding admin page.
    app.router.route(/^\/?admin\/coding$/, "admin#coding");

    // The project admin page.
    app.router.route(/^\/?admin\/project(\/.*)$/, "admin#project");

    // The gaming admin page.
    app.router.route(/^\/?admin\/gaming$/, "admin#gaming");

    // The YouTube admin page.
    app.router.route(/^\/?admin\/youtube$/, "admin#youtube");

    // The redirect admin page.
    app.router.route(/^\/?admin\/redirect$/, "admin#redirect");
};
