/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 * @typedef {import("../../types/browser/viewTypes").HomeViewParameters} ViewTypes.HomeViewParameters
 */

const Blog = require("../../src/models/blog"),
    Common = require("../includes/common"),
    Feature = require("../../src/models/feature"),
    HomeView = require("../../public/views/home"),
    NecroDancer = require("../../src/models/necrodancer"),
    Profile = require("../../src/models/profile"),
    Project = require("../../src/models/project"),
    Repository = require("../../src/models/repository"),
    RouterBase = require("hot-router").RouterBase,
    Speedrun = require("../../src/models/speedrun"),
    Track = require("../../src/models/track"),
    User = require("../../src/models/user");

//   #   #
//   #   #
//   #   #   ###   ## #    ###
//   #####  #   #  # # #  #   #
//   #   #  #   #  # # #  #####
//   #   #  #   #  # # #  #
//   #   #   ###   #   #   ###
/**
 * A class that represents the home page.
 */
class Home extends RouterBase {
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

        route.path = "/";

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
        const go = req.query.go && req.query.go.toString() || void 0;

        /** @type {ViewTypes.HomeViewParameters} */
        const data = {};

        /** @type {User} */
        let user = await User.getCurrent(req);

        switch (go) {
            case "validation":
                {
                    const userId = req.query.u && req.query.u.toString() || void 0,
                        code = req.query.v && req.query.v.toString() || void 0;

                    if (userId && code) {
                        data.validated = (await User.validate(userId, code, "register")).validated;
                    }
                }
                break;
            case "passwordReset":
                {
                    const userId = req.query.u && req.query.u.toString() || void 0,
                        code = req.query.a && req.query.a.toString() || void 0;

                    if (userId && code && (await User.validate(userId, code, "password")).validated) {
                        req.session.allowPasswordChange = userId;
                        res.redirect(302, "/account/change-password");
                        return;
                    }
                }
                break;
            case "emailChange":
                {
                    const userId = req.query.u && req.query.u.toString() || void 0,
                        code = req.query.a && req.query.a.toString() || void 0;

                    if (userId && code && (await User.validate(userId, code, "emailChange")).validated) {
                        req.session.allowEmailChange = userId;

                        if (user && user.id === userId) {
                            res.redirect(302, "/account/change-email");
                            return;
                        }

                        data.emailChangeAuthorized = true;
                        break;
                    }
                }
                break;
            case "emailValidate":
                {
                    const userId = req.query.u && req.query.u.toString() || void 0,
                        code = req.query.a && req.query.a.toString() || void 0;

                    if (userId && code) {
                        const validated = await User.validate(userId, code, "emailValidate");

                        if (validated.validated && validated.data && validated.data.email) {

                            await User.changeEmail(userId, validated.data.email);

                            await User.logout(req, res);
                            user = void 0;

                            data.emailChanged = true;
                        }
                    }
                }
                break;
            case "changePasswordSuccess":
                if (!user) {
                    data.changePasswordSuccess = true;
                }
                break;
            case "changeEmailSuccess":
                if (user && user.awaitingValidation("emailValidate")) {
                    data.changeEmailSuccess = true;
                }
                break;
        }

        /** @type {Project[]} */
        let projects;

        await Promise.all([
            (async () => {
                data.titles = await Blog.getTitles(0, 5);
            })(),
            (async () => {
                const features = await Feature.getAll();
                data.features = {
                    music: features.filter((f) => f.section === "music").sort((a, b) => a.order - b.order),
                    coding: features.filter((f) => f.section === "coding").sort((a, b) => a.order - b.order),
                    gaming: features.filter((f) => f.section === "gaming").sort((a, b) => a.order - b.order),
                    life: features.filter((f) => f.section === "life").sort((a, b) => a.order - b.order)
                };
            })(),
            (async () => {
                data.recent = await Track.getTracks(0, 5);
                data.classics = await Track.getTracksByTag("Classic", 0, 5);
            })(),
            (async () => {
                data.commits = await Repository.getCommits(0, 5);
                data.releases = await Repository.getReleases(0, 5);
            })(),
            (async () => {
                projects = await Project.getAll();
            })(),
            (async () => {
                data.wow = await Profile.getWowProfile();
            })(),
            (async () => {
                data.d3 = await Profile.getD3Profiles();
            })(),
            (async () => {
                data.ff14 = await Profile.getFF14Profile();
            })(),
            (async () => {
                data.speedruns = await Speedrun.getSpeedruns(0, 5);
            })(),
            (async () => {
                data.necrodancer = await NecroDancer.getRuns(0, 5);
            })()
        ]);

        if (projects) {
            for (const commit of data.commits) {
                const project = projects.find((p) => `${p.github.user}/${p.github.repository}` === commit.repo.url);

                if (project) {
                    commit.url = project.url;
                }
            }
        }

        if (projects) {
            for (const release of data.releases) {
                const project = projects.find((p) => `${p.github.user}/${p.github.repository}` === release.repo.url);

                if (project) {
                    release.url = project.url;
                }
            }
        }

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: [],
                views: [
                    {
                        name: "HomeView",
                        path: "/views/home.js"
                    }
                ],
                view: "HomeView",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {},
                HomeView.get(data),
                HomeView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = Home;
