/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Comment = require("../../src/models/comment"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #   #             #                        #       #                    #    ####    ###
//   # #       #                       #   #             #                        #                           # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   ## ##   ###    ## #   ###   # ##    ###   ####    ##     ###   # ##   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  # # #  #   #  #  ##  #   #  ##  #      #   #       #    #   #  ##  #  #   #  ####     #
//  #####  #   #  # # #    #    #   #  #   #  #   #  #   #  #####  #       ####   #       #    #   #  #   #  #####  #        #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #  ##  #      #      #   #   #  #    #    #   #  #   #  #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ####    ##    ###    ###   #   #  #   #  #       ###
/**
 * A class that handles calls to the admin moderation API.
 */
class AdminModerationAPI extends RouterBase {
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

        route.path = "/api/admin/moderation";

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

            if (!req.body.id) {
                res.status(400).json({error: "Bad request, you must send the comment ID."});
                return;
            }

            const comment = await Comment.get(req.body.id);

            if (!comment) {
                res.status(404).json({error: "Not found, comment ID does not exist."});
                return;
            }

            await comment.delete();

            const comments = await Comment.getUnmoderated();

            res.status(200).json(comments);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminModerationAPI.route.path}.`, {err});
        }
    }

    //                     #
    //                     #
    // ###    ##    ###   ###
    // #  #  #  #  ##      #
    // #  #  #  #    ##    #
    // ###    ##   ###      ##
    // #
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async post(req, res) {
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

            if (!req.body.id) {
                res.status(400).json({error: "Bad request, you must send the comment ID."});
                return;
            }

            const comment = await Comment.get(req.body.id);

            if (!comment) {
                res.status(404).json({error: "Not found, comment ID does not exist."});
                return;
            }

            await comment.accept();

            const comments = await Comment.getUnmoderated();

            res.status(200).json(comments);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminModerationAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminModerationAPI;
