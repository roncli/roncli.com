/**
 * A callback to match a route.
 * @callback routes.Callback
 * @param {string} path The path to match against.
 * @param {string} route The route to use, which is a controller and function joined by a pound sign.
 */

/**
 * The routes in use by the website.
// * @param {routes.Callback} match The function to add a route with.
 * @param {function(string, string)} match The function to add a route with.
 */
module.exports = function(match) {
    "use strict";

    // The home page.
    match("", "home#index");
    match("/", "home#index");
    match("?*qs", "home#index");
    match("/?*qs", "home#index");

    match("/account", "account#index");

    // TODO: Add a 404 handler
};
