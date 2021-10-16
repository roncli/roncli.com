/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    MusicTrackView = require("../../public/views/musicTrack"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    Track = require("../../src/models/track"),
    User = require("../../src/models/user");


//  #   #                  #           #####                       #
//  #   #                                #                         #
//  ## ##  #   #   ###    ##     ###     #    # ##    ###    ###   #   #
//  # # #  #   #  #        #    #   #    #    ##  #      #  #   #  #  #
//  #   #  #   #   ###     #    #        #    #       ####  #      ###
//  #   #  #  ##      #    #    #   #    #    #      #   #  #   #  #  #
//  #   #   ## #  ####    ###    ###     #    #       ####   ###   #   #
/**
 * A class that represents the music track controller.
 */
class MusicTrack extends RouterBase {
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

        route.path = "/soundcloud/:id/:url";

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
        const user = await User.getCurrent(req);

        /** @type {string} */
        let category = void 0;

        if (req.headers["content-type"] === "application/json") {
            if (req.query && req.query.category) {
                category = `${req.query.category}`;
            }
        }

        const [track, page, categories, comments] = await Promise.all([Track.getTrackById(req.params.id), Page.getByPath(req.path), Track.getCategories(), Comment.getByUrl(req.path, user)]);

        if (page) {
            await page.loadMetadata();
        }

        const data = {
            category,
            page,
            track,
            categories
        };

        const info = {
            category,
            categories,
            page
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: ["/css/musicTrack.css"],
                js: [],
                views: [
                    {
                        name: "MusicTrackView",
                        path: "/views/musicTrack.js"
                    }
                ],
                view: "MusicTrackView",
                comments,
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                comments,
                {
                    css: ["/css/musicTrack.css"]
                },
                MusicTrackView.get(data),
                MusicTrackView.getInfo(info),
                req,
                user
            ));
        }
    }
}

module.exports = MusicTrack;
