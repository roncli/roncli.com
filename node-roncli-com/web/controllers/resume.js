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
                "",
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
