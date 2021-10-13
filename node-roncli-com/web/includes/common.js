/**
 * @typedef {import("../../src/models/comment")} Comment
 * @typedef {import("../../types/node/commonTypes").Files} CommonTypes.Files
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 * @typedef {import("../../src/models/user")} User
 */

const Contact = require("../../src/models/contact"),
    HtmlMinifierTerser = require("html-minifier-terser"),
    IndexView = require("../../public/views/index"),
    Minify = require("@roncli/node-minify"),
    NotFoundView = require("../../public/views/404"),
    pjson = require("../../package.json"),
    RouterBase = require("hot-router").RouterBase;

//   ###
//  #   #
//  #       ###   ## #   ## #    ###   # ##
//  #      #   #  # # #  # # #  #   #  ##  #
//  #      #   #  # # #  # # #  #   #  #   #
//  #   #  #   #  # # #  # # #  #   #  #   #
//   ###    ###   #   #  #   #   ###   #   #
/**
 * A class that handles common web functions.
 */
class Common extends RouterBase {
    //                    #
    //                    #
    // ###    ##   #  #  ###    ##
    // #  #  #  #  #  #   #    # ##
    // #     #  #  #  #   #    ##
    // #      ##    ###    ##   ##
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.include = true;

        return route;
    }

    //              #    ####                       #
    //              #    #                          #
    // ###    ##   ###   ###    ##   #  #  ###    ###
    // #  #  #  #   #    #     #  #  #  #  #  #  #  #
    // #  #  #  #   #    #     #  #  #  #  #  #  #  #
    // #  #   ##     ##  #      ##    ###  #  #   ###
    /**
     * Generates a not found page.
     * @param {Express.Request} req The request of the page.
     * @param {Express.Response} res The response of the page.
     * @param {User} user The user.
     * @returns {Promise} A promise that resolves when the page is generated.
     */
    static async notFound(req, res, user) {
        if (req.headers["content-type"] === "application/json") {
            if (req.method === "GET") {
                res.status(404).json({
                    css: ["/css/error.css"],
                    views: [
                        {
                            name: "NotFoundView",
                            path: "/views/404.js"
                        }
                    ],
                    view: "NotFoundView",
                    data: {message: "This page does not exist."}
                });
            } else {
                res.status(404).json({error: "Page not found."});
            }
        } else {
            res.status(404).send(await Common.page(
                "",
                void 0,
                {css: ["/css/error.css"]},
                NotFoundView.get(),
                NotFoundView.getInfo(),
                req,
                user
            ));
        }
    }

    // ###    ###   ###   ##
    // #  #  #  #  #  #  # ##
    // #  #  # ##   ##   ##
    // ###    # #  #      ##
    // #            ###
    /**
     * Generates a webpage from the provided HTML using a common template.
     * @param {string} head The HTML to insert into the header.
     * @param {Comment[]} comments Whether to include a comments section.
     * @param {CommonTypes.Files} files The files to combine and minify.
     * @param {string} pageHtml The HTML to make a web page from.
     * @param {string} infoHtml The HTML to insert into the info panel.
     * @param {Express.Request} req The request of the page.
     * @param {User} user The user.
     * @returns {Promise<string>} A promise that returns the HTML of the full web page.
     */
    static async page(head, comments, files, pageHtml, infoHtml, req, user) {
        const userLinks = [];

        if (user) {
            if (user && await user.is("SiteAdmin")) {
                userLinks.push({
                    title: "Admin",
                    href: "/admin"
                });
            }
        }

        const commonFiles = {js: [], css: []};

        commonFiles.js.unshift("/js/spa.js");
        commonFiles.js.unshift("/js/common/comments.js");
        commonFiles.js.unshift("/js/index.js");
        commonFiles.js.unshift("/js/common/time.js");
        commonFiles.js.unshift("/js/common/numbers.js");
        commonFiles.js.unshift("/js/common/encoding.js");
        commonFiles.js.unshift("/js/common/template.js");
        commonFiles.js.unshift("/js/common/modal.js");
        commonFiles.js.unshift("/js/timeago.js/timeago.js");
        commonFiles.js.unshift("/js/editor.js/quote.js");
        commonFiles.js.unshift("/js/editor.js/editor.js");
        commonFiles.css.unshift("/css/common.css");
        commonFiles.css.unshift("/css/modal.css");
        commonFiles.css.unshift("/css/reset.css");
        commonFiles.css.unshift("/css/bootstrap-icons.css");
        commonFiles.css.unshift("/css/archivo-narrow-700.css");
        commonFiles.css.unshift("/css/archivo-narrow-400.css");

        head = /* html */`
            ${head}
            ${Minify.combine(commonFiles.js, "js")}
            ${Minify.combine(commonFiles.css, "css")}
            ${files && files.js && files.js.length > 0 ? Minify.combine(files.js, "js") : ""}
            ${files && files.css && files.css.length > 0 ? Minify.combine(files.css, "css") : ""}
            <meta name="apple-mobile-web-app-title" content="roncli.com">
            <meta name="application-name" content="roncli.com">
            <meta name="msapplication-TileColor" content="#191935">
            <meta name="msapplication-config" content="/images/browserconfig.xml">
            <meta name="theme-color" content="#ffffff">
            <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
            <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
            <link rel="manifest" href="/images/site.webmanifest">
            <link rel="mask-icon" href="/images/safari-pinned-tab.svg" color="#191935">
            <link rel="shortcut icon" href="/images/favicon.ico">
        `;

        return HtmlMinifierTerser.minify(
            IndexView.get({
                head,
                pageHtml,
                infoHtml,
                host: req.get("host"),
                originalUrl: req.originalUrl,
                year: new Date().getFullYear(),
                version: pjson.version,
                user,
                userLinks,
                contacts: await Contact.getAll(),
                comments
            }),
            {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                conservativeCollapse: true,
                decodeEntities: true,
                html5: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        );
    }
}

module.exports = Common;
