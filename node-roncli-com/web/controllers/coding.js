/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    CodingView = require("../../public/views/coding"),
    Page = require("../../src/models/page"),
    Project = require("../../src/models/project"),
    Repository = require("../../src/models/repository"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//   ###              #    #
//  #   #             #
//  #       ###    ## #   ##    # ##    ## #
//  #      #   #  #  ##    #    ##  #  #  #
//  #      #   #  #   #    #    #   #   ##
//  #   #  #   #  #  ##    #    #   #  #
//   ###    ###    ## #   ###   #   #   ###
//                                     #   #
//                                      ###
/**
 * A class that represents the coding controller.
 */
class Coding extends RouterBase {
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

        route.path = "/coding";

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
        const [user, page, projects, {commits, releases}] = await Promise.all([
            User.getCurrent(req),
            (async () => {
                const result = await Page.getByPath(req.path);
                await result.loadMetadata();

                return result;
            })(),
            Project.getAll(),
            (async () => ({
                commits: await Repository.getCommits(0, -1),
                releases: await Repository.getReleases(0, -1)
            }))()
        ]);

        if (projects) {
            for (const commit of commits) {
                const project = projects.find((p) => `${p.github.user}/${p.github.repository}` === commit.repo.name);

                if (project) {
                    commit.url = project.url;
                }
            }

            for (const release of releases) {
                const project = projects.find((p) => `${p.github.user}/${p.github.repository}` === release.repo.name);

                if (project) {
                    release.url = project.url;
                }
            }
        }

        const data = {
            user,
            page,
            projects,
            commits,
            releases
        };

        const info = {
            page,
            projects
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: ["/css/coding.css"],
                js: [],
                views: [
                    {
                        name: "CodingView",
                        path: "/views/coding.js"
                    }
                ],
                view: "CodingView",
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {
                    css: ["/css/coding.css"]
                },
                CodingView.get(data),
                CodingView.getInfo(info),
                req,
                user
            ));
        }
    }
}

module.exports = Coding;
