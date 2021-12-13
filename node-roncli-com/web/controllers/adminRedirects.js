/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminRedirectsView = require("../../public/views/adminRedirects"),
    Common = require("../includes/common"),
    Redirect = require("../../src/models/redirect"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####              #    #                          #
//   # #       #                       #   #             #                               #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ##    # ##    ###    ###   ####    ###
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #  ##    #    ##  #  #   #  #   #   #     #
//  #####  #   #  # # #    #    #   #  # #    #####  #   #    #    #      #####  #       #      ###
//  #   #  #  ##  # # #    #    #   #  #  #   #      #  ##    #    #      #      #   #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ###    ###     ##   ####
/**
 * A class that represents the admin redirects page.
 */
class AdminRedirects extends RouterBase {
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

        route.path = "/admin/redirects";

        return route;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        if (!user || !await user.is("SiteAdmin")) {
            await Common.notFound(req, res, user);
            return;
        }

        const redirects = await Redirect.getAll();

        const data = {redirects};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Redirects - Admin - roncli.com",
                css: [],
                js: ["/js/adminRedirects.js"],
                views: [
                    {
                        name: "AdminRedirectsView",
                        path: "/views/adminRedirects.js"
                    }
                ],
                view: "AdminRedirectsView",
                jsClass: "AdminRedirects",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Redirects - Admin - roncli.com</title>
                    <meta name="og:description" content="Manage redirects on ronc.li." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Redirects Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Manage redirects on ronc.li." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Redirects Admin" />
                `,
                void 0,
                {js: ["/js/adminRedirects.js"]},
                AdminRedirectsView.get(data),
                AdminRedirectsView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminRedirects;
