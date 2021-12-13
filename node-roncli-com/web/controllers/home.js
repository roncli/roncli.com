/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
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
    SteamGame = require("../../src/models/steamGame"),
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

        let user = await User.getCurrent(req);

        let validated, emailChangeAuthorized, emailChanged, changePasswordSuccess, changeEmailSuccess;

        switch (go) {
            case "validation":
                {
                    const userId = req.query.u && req.query.u.toString() || void 0,
                        code = req.query.v && req.query.v.toString() || void 0;

                    if (userId && code) {
                        validated = (await User.validate(userId, code, "register")).validated;
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

                        emailChangeAuthorized = true;
                        break;
                    }
                }
                break;
            case "emailValidate":
                {
                    const userId = req.query.u && req.query.u.toString() || void 0,
                        code = req.query.a && req.query.a.toString() || void 0;

                    if (userId && code) {
                        const emailValidated = await User.validate(userId, code, "emailValidate");

                        if (emailValidated.validated && emailValidated.data && emailValidated.data.email) {

                            await User.changeEmail(userId, emailValidated.data.email);

                            await User.logout(req, res);
                            user = void 0;

                            emailChanged = true;
                        }
                    }
                }
                break;
            case "changePasswordSuccess":
                if (!user) {
                    changePasswordSuccess = true;
                }
                break;
            case "changeEmailSuccess":
                if (user && user.awaitingValidation("emailValidate")) {
                    changeEmailSuccess = true;
                }
                break;
        }

        const [titles, features, {recent, classics}, {commits, releases}, projects, steamGames, wow, d3, ff14, [speedruns, necrodancer]] = await Promise.all([
            Blog.getTitles(0, 5),
            (async () => {
                const allFeatures = await Feature.getAll();

                return {
                    music: allFeatures.filter((f) => f.section === "music").sort((a, b) => a.order - b.order),
                    coding: allFeatures.filter((f) => f.section === "coding").sort((a, b) => a.order - b.order),
                    gaming: allFeatures.filter((f) => f.section === "gaming").sort((a, b) => a.order - b.order),
                    life: allFeatures.filter((f) => f.section === "life").sort((a, b) => a.order - b.order)
                };
            })(),
            (async () => ({
                recent: await Track.getTracks(0, 5),
                classics: await Track.getTracksByCategory("Classic", 0, 5)
            }))(),
            (async () => ({
                commits: await Repository.getCommits(0, 5),
                releases: await Repository.getReleases(0, 5)
            }))(),
            Project.getAll(),
            SteamGame.getRecentGames(0, 5),
            Profile.getWowProfile(),
            Profile.getD3Profiles(),
            Profile.getFF14Profile(),
            Promise.all([
                Speedrun.getSpeedruns(0, 5),
                NecroDancer.getRuns(0, 5)
            ])
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
            validated,
            emailChangeAuthorized,
            emailChanged,
            changePasswordSuccess,
            changeEmailSuccess,
            titles,
            features,
            recent,
            classics,
            commits,
            releases,
            steamGames,
            wow,
            d3,
            ff14,
            speedruns,
            necrodancer
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "roncli.com",
                css: ["/css/home.css"],
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
                /* html */`
                    <title>roncli.com</title>
                    <meta name="og:description" content="Welcome to roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="roncli.com" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Welcome to roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="roncli.com" />
                `,
                void 0,
                {css: ["/css/home.css"]},
                HomeView.get(data),
                HomeView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = Home;
