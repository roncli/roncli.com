/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    Encoding = require("../../public/js/common/encoding"),
    Page = require("../../src/models/page"),
    PlaylistModel = require("../../src/models/playlist"),
    PlaylistView = require("../../public/views/playlist"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  ####    ##                   ##      #            #
//  #   #    #                    #                   #
//  #   #    #     ###   #   #    #     ##     ###   ####
//  ####     #        #  #   #    #      #    #       #
//  #        #     ####  #  ##    #      #     ###    #
//  #        #    #   #   ## #    #      #        #   #  #
//  #       ###    ####      #   ###    ###   ####     ##
//                       #   #
//                        ###
/**
 * A class that represents the playlist controller.
 */
class Playlist extends RouterBase {
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

        route.path = "/playlist/:id/:name";

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
        const [user, playlist] = await Promise.all([User.getCurrent(req), PlaylistModel.get(req.params.id)]);

        if (!playlist) {
            await Common.notFound(req, res, user);
            return;
        }

        const [page, comments] = await Promise.all([
            Page.getByPath(`/playlist/${req.params.id}/${req.params.name}`),
            Comment.getByUrl(`/playlist/${req.params.id}/${req.params.name}`, user)
        ]);

        const data = {page, playlist};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: `${playlist.title} - roncli.com`,
                css: [],
                js: ["/js/playlist.js"],
                views: [
                    {
                        name: "PlaylistView",
                        path: "/views/playlist.js"
                    }
                ],
                view: "PlaylistView",
                comments,
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>${Encoding.htmlEncode(playlist.title)} - roncli.com</title>
                    <meta name="og:description" content="Watch the playlist &quot;${Encoding.attributeEncode(playlist.title)}&quot; on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="${Encoding.attributeEncode(playlist.title)}" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Watch the playlist &quot;${Encoding.attributeEncode(playlist.title)}&quot; on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="${Encoding.attributeEncode(playlist.title)}" />
                `,
                comments,
                {
                    js: ["/js/playlist.js"]
                },
                PlaylistView.get(data),
                PlaylistView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = Playlist;
