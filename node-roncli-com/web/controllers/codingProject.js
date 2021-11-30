/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    CodingProjectView = require("../../public/views/codingProject"),
    Page = require("../../src/models/page"),
    Project = require("../../src/models/project"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//   ###              #    #                  ####                    #                  #
//  #   #             #                       #   #                                      #
//  #       ###    ## #   ##    # ##    ## #  #   #  # ##    ###     ##    ###    ###   ####
//  #      #   #  #  ##    #    ##  #  #  #   ####   ##  #  #   #     #   #   #  #   #   #
//  #      #   #  #   #    #    #   #   ##    #      #      #   #     #   #####  #       #
//  #   #  #   #  #  ##    #    #   #  #      #      #      #   #     #   #      #   #   #  #
//   ###    ###    ## #   ###   #   #   ###   #      #       ###   #  #    ###    ###     ##
//                                     #   #                       #  #
//                                      ###                         ##
/**
 * A class that represents the coding project controller.
 */
class CodingProject extends RouterBase {
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

        route.path = "/project/:name";

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
     * @returns {Promise} A promise that resolves when the request has been processed.
     */
    static async get(req, res) {
        const [user, project] = await Promise.all([
            User.getCurrent(req),
            Project.getByPath(req.path)
        ]);

        if (!project) {
            await Common.notFound(req, res, user);
            return;
        }

        const [page, projects] = await Promise.all([
            (async () => {
                const result = await Page.getByPath(req.path);
                if (result) {
                    await result.loadMetadata();
                }

                return result;
            })(),
            Project.getAll(),
            project.loadRepository()
        ]);

        const data = {
            page,
            project
        };

        const info = {
            page,
            projects,
            title: project.title
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: ["/css/codingProject.css"],
                js: [],
                views: [
                    {
                        name: "CodingProjectView",
                        path: "/views/codingProject.js"
                    }
                ],
                view: "CodingProjectView",
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {css: ["/css/codingProject.css"]},
                CodingProjectView.get(data),
                CodingProjectView.getInfo(info),
                req,
                user
            ));
        }
    }
}

module.exports = CodingProject;
