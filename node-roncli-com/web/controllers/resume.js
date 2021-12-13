/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const ResumeView = require("../../public/views/resume"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  ####
//  #   #
//  #   #   ###    ###   #   #  ## #    ###
//  ####   #   #  #      #   #  # # #  #   #
//  # #    #####   ###   #   #  # # #  #####
//  #  #   #          #  #  ##  # # #  #
//  #   #   ###   ####    ## #  #   #   ###
/**
 * A class that represents the résumé controller.
 */
class Resume extends RouterBase {
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

        route.path = "/r(?:[eé]|%C3%A9)sum([eé]|%C3%A9)";

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

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Résumé - roncli.com",
                css: ["/css/resume.css"],
                js: ["/js/resume.js"],
                views: [
                    {
                        name: "ResumeView",
                        path: "/views/resume.js"
                    }
                ],
                view: "ResumeView",
                jsClass: "Resume"
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Résumé - roncli.com</title>
                    <meta name="og:description" content="The professional résumé of Ronald M. Clifford." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Résumé" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="The professional résumé of Ronald M. Clifford." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Résumé" />
                `,
                void 0,
                {
                    css: ["/css/resume.css"],
                    js: ["/js/resume.js"]
                },
                ResumeView.get(),
                ResumeView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = Resume;
