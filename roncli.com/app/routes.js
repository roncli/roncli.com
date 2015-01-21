/**
 * A callback to match a route.
 * @callback routes.Callback
 * @param {string} path The path to match against.
 * @param {string} route The route to use, which is a controller and function joined by a pound sign.
 */

/**
 * The routes in use by the website.
 * @param {routes.Callback} match The function to add a route with.
 */
module.exports = function(match) {
    "use strict";

    // The home page.  Includes optional querystring.
    match(/^\/?(?:\?.*)?$/, "home#index");

    // The account page.
    match(/^\/?account$/, "account#index");

    // The blog page.
    match(/^\/?blog$/, "blog#index");

    // Blog categories.
    match(/^\/?blog\/category\/([^\/]+)$/, "blog#category");

    // Specific blog pages.
    match(/^\/?((?:blogger|tumblr)\/[0-9]+\/[^\/]+)$/, "blog#url");

    // The default route if none of the above match.
    match(/(?:.*)/, "default#index");
};
