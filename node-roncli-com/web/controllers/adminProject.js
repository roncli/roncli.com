/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminProjectView = require("../../public/views/adminProject"),
    Common = require("../includes/common"),
    Project = require("../../src/models/project"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####                    #                  #
//   # #       #                       #   #                                      #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##
//                                                          #  #
//                                                           ##
/**
 * A class that represents the admin project page.
 */
class AdminProject extends RouterBase {
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

        route.path = "/admin/project:path((?:/*)?)$";

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

        const project = await Project.getByPath(req.params.path);

        if (!project) {
            await Common.notFound(req, res, user);
            return;
        }

        const data = {project};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: ["/js/adminProject.js"],
                views: [
                    {
                        name: "AdminProjectView",
                        path: "/views/adminProject.js"
                    }
                ],
                view: "AdminProjectView",
                jsClass: "AdminProject",
                data,
                info: data
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {js: ["/js/adminProject.js"]},
                AdminProjectView.get(data),
                AdminProjectView.getInfo(data),
                req,
                user
            ));
        }
    }
}

module.exports = AdminProject;
