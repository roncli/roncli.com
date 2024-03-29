/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminResumeView = require("../../public/views/adminResume"),
    Common = require("../includes/common"),
    Resume = require("../../src/models/resume"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####
//   # #       #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ###   #   #  ## #    ###
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #      #   #  # # #  #   #
//  #####  #   #  # # #    #    #   #  # #    #####   ###   #   #  # # #  #####
//  #   #  #  ##  # # #    #    #   #  #  #   #          #  #  ##  # # #  #
//  #   #   ## #  #   #   ###   #   #  #   #   ###   ####    ## #  #   #   ###
/**
 * A class that represents the admin résumé page.
 */
class AdminResume extends RouterBase {
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

        route.path = "/admin/r(?:[eé]|%C3%A9)sum([eé]|%C3%A9)";

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

        const resume = await Resume.get(),
            data = {resume};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Résumé - Admin - roncli.com",
                css: [],
                js: ["/js/adminResume.js"],
                views: [
                    {
                        name: "AdminResumeView",
                        path: "/views/adminResume.js"
                    }
                ],
                view: "AdminResumeView",
                jsClass: "AdminResume",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Résumé - Admin - roncli.com</title>
                    <meta name="og:description" content="Update the résumé on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Résumé Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Update the résumé on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Résumé Admin" />
                `,
                void 0,
                {js: ["/js/adminResume.js"]},
                AdminResumeView.get(data),
                AdminResumeView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminResume;
