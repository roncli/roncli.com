/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    Encoding = require("../../public/js/common/encoding"),
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

        const track = await Track.getTrackById(req.params.id);

        if (!track) {
            await Common.notFound(req, res, user);
            return;
        }

        const [page, categories, comments] = await Promise.all([
            (async () => {
                const result = await Page.getByPath(req.path);
                if (result) {
                    await result.loadMetadata();
                }

                return result;
            })(),
            Track.getCategories(),
            Comment.getByUrl(req.path, user)
        ]);

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
                track: `${track.title} - Music - roncli.com`,
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
                /* html */`
                    <title>${Encoding.htmlEncode(track.title)} - Music - roncli.com</title>
                    <meta name="og:description" content="Listen to &quot;${Encoding.attributeEncode(track.title)}&quot; from The Nightstalker on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="${Encoding.attributeEncode(track.title)}" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:app:id:googleplay" content="com.soundcloud.android" />
                    <meta name="twitter:app:id:ipad" content="336353151" />
                    <meta name="twitter:app:id:iphone" content="336353151" />
                    <meta name="twitter:app:name:googleplay" content="SoundCloud" />
                    <meta name="twitter:app:name:ipad" content="SoundCloud" />
                    <meta name="twitter:app:name:iphone" content="SoundCloud" />
                    <meta name="twitter:app:url:ipad" content="soundcloud://sounds:${track.id}" />
                    <meta name="twitter:app:url:iphone" content="soundcloud://sounds:${track.id}" />
                    <meta name="twitter:app:url:googleplay" content="soundcloud://sounds:${track.id}" />
                    <meta name="twitter:card" content="player" />
                    <meta name="twitter:description" content="Listen to &quot;${Encoding.attributeEncode(track.title)}&quot; from The Nightstalker on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:player" content="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F${track.id}&amp;auto_play=false&amp;show_artwork=true&amp;visual=true&amp;origin=twitter" />
                    <meta name="twitter:player:height" content="400" />
                    <meta name="twitter:player:width" content="435" />
                    <meta name="twitter:title" content="${Encoding.attributeEncode(track.title)}" />
                `,
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
