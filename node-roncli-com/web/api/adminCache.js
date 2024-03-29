/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Blog = require("../../src/models/blog"),
    Log = require("@roncli/node-application-insights-logger"),
    NecroDancer = require("../../src/models/necrodancer"),
    Profile = require("../../src/models/profile"),
    Project = require("../../src/models/project"),
    Repository = require("../../src/models/repository"),
    RouterBase = require("hot-router").RouterBase,
    Speedrun = require("../../src/models/speedrun"),
    SteamGame = require("../../src/models/steamGame"),
    Track = require("../../src/models/track"),
    User = require("../../src/models/user");

//    #        #           #            ###                 #               #    ####    ###
//   # #       #                       #   #                #              # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #       ###    ###   # ##    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  #          #  #   #  ##  #  #   #  #   #  ####     #
//  #####  #   #  # # #    #    #   #  #       ####  #      #   #  #####  #####  #        #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #  #   #  #      #   #  #        #
//  #   #   ## #  #   #   ###   #   #   ###    ####   ###   #   #   ###   #   #  #       ###
/**
 * A class that handles calls to the admin cache API.
 */
class AdminCacheAPI extends RouterBase {
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

        route.path = "/api/admin/cache";

        return route;
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async delete(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }
            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            if (!req.body.cache) {
                res.status(400).json({error: "Bad request, you must send the cache to clear."});
                return;
            }

            // Increase timeout to allow for all necessary calls to finish.
            req.setTimeout(300000);

            switch (req.body.cache) {
                case "blog":
                    await Blog.clearCache();
                    await Blog.cacheBlog();
                    res.sendStatus(204);
                    break;
                case "d3":
                    await Profile.clearD3Cache();
                    await Profile.cacheD3();
                    res.sendStatus(204);
                    break;
                case "ff14":
                    await Profile.clearFF14Cache();
                    await Profile.cacheFF14();
                    res.sendStatus(204);
                    break;
                case "github":
                    await Promise.all([Project.clearCache(), Repository.clearCache()]);
                    await Repository.cacheEvents();
                    res.sendStatus(204);
                    break;
                case "necrolab":
                    await NecroDancer.clearCache();
                    await NecroDancer.cacheNecrolab();
                    res.sendStatus(204);
                    break;
                case "soundcloud":
                    await Track.clearCache();
                    await Track.cacheSoundCloud();
                    res.sendStatus(204);
                    break;
                case "speedrun.com":
                    await Speedrun.clearCache();
                    await Speedrun.cacheSpeedruns();
                    res.sendStatus(204);
                    break;
                case "steam":
                    await SteamGame.clearCache();
                    await SteamGame.cacheGames();
                    res.sendStatus(204);
                    break;
                case "wow":
                    await Profile.clearWoWCache();
                    await Profile.cacheWoW();
                    res.sendStatus(204);
                    break;
                default:
                    res.status(400).json({error: "Bad request, the specified cache does not exist."});
                    return;
            }
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminCacheAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminCacheAPI;
