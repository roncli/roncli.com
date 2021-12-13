/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminProjectsView = require("../../public/views/adminProjects"),
    Common = require("../includes/common"),
    Project = require("../../src/models/project"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####                    #                  #
//   # #       #                       #   #                                      #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####    ###
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #     #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #      ###
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##   ####
//                                                          #  #
//                                                           ##
/**
 * A class that represents the admin projects page.
 */
class AdminProjects extends RouterBase {
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

        route.path = "/admin/projects";

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

        const projects = await Project.getAll();

        const data = {projects};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Projects - Admin - roncli.com",
                css: [],
                js: ["/js/sortable/sortable.js", "/js/adminProjects.js"],
                views: [
                    {
                        name: "AdminProjectsView",
                        path: "/views/adminProjects.js"
                    }
                ],
                view: "AdminProjectsView",
                jsClass: "AdminProjects",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Projects - Admin - roncli.com</title>
                    <meta name="og:description" content="Manage and edit projects on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Projects Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Manage and edit projects on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Projects Admin" />
                `,
                void 0,
                {js: ["/js/sortable/sortable.js", "/js/adminProjects.js"]},
                AdminProjectsView.get(data),
                AdminProjectsView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminProjects;
