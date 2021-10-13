/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Comment = require("../../src/models/comment"),
    EditorJSParser = require("editorjs-parser"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

/** @type {EditorJSParser} */
const parser = new EditorJSParser(void 0, {
    quote: (data) => `<blockquote><div>${data.caption}</div><div>${data.text}</div></blockquote>`
});

//   ###                                       #       #    ####    ###
//  #   #                                      #      # #   #   #    #
//  #       ###   ## #   ## #    ###   # ##   ####   #   #  #   #    #
//  #      #   #  # # #  # # #  #   #  ##  #   #     #   #  ####     #
//  #      #   #  # # #  # # #  #####  #   #   #     #####  #        #
//  #   #  #   #  # # #  # # #  #      #   #   #  #  #   #  #        #
//   ###    ###   #   #  #   #   ###   #   #    ##   #   #  #       ###
/**
 * A class that handles calls to the login API.
 */
class CommentAPI extends RouterBase {
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

        route.path = "/api/comment";

        return route;
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

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const {url, data} = req.body;

            if (!url) {
                res.status(422).json({error: "Unprocessable, you must include a URL."});
                return;
            }

            if (!data) {
                res.status(422).json({error: "Unprocessable, you must include comment data."});
                return;
            }

            /** @type {string} */
            let html;
            try {
                html = parser.parse(data);
            } catch (err) {
                res.status(422).json({error: "Unprocessable, the comment data is invalid."});
                return;
            }

            const comment = new Comment({
                comment: html,
                dateAdded: new Date(),
                dateModerated: await user.is("SiteAdmin") ? new Date() : void 0,
                url,
                userId: user.id,
                username: user.username
            });

            await comment.add();

            res.status(200).json(comment);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${CommentAPI.route.path}.`, {err});
        }
    }
}

module.exports = CommentAPI;
