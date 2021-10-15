/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    MusicView = require("../../public/views/music"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    Track = require("../../src/models/track"),
    User = require("../../src/models/user");

//  #   #                  #
//  #   #
//  ## ##  #   #   ###    ##     ###
//  # # #  #   #  #        #    #   #
//  #   #  #   #   ###     #    #
//  #   #  #  ##      #    #    #   #
//  #   #   ## #  ####    ###    ###
/**
 * A class that represents the music controller.
 */
class Music extends RouterBase {
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

        route.path = "/music";

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
        const [user, page, tracks, categories, count] = await Promise.all([User.getCurrent(req), Page.getByPath(req.path), Track.getTracks(0, Track.pageSize), Track.getCategories(), Track.countTracks()]);

        await page.loadMetadata();

        let local, newestDate;

        if (tracks && tracks.length > 0) {
            local = tracks[0].publishDate.toLocaleString("en-US", {hour12: false, year: "numeric", month: "2-digit", day: "2-digit"});
            newestDate = [local.substr(6, 4), local.substr(0, 2), local.substr(3, 2)].join("-");
        }

        const data = {
            page,
            tracks,
            categories: categories.sort((a, b) => b.tracks - a.tracks),
            count,
            pageSize: Track.pageSize,
            newestDate
        };

        const info = {
            categories,
            page
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: ["/css/music.css"],
                js: ["/js/music.js"],
                views: [
                    {
                        name: "MusicTracksView",
                        path: "/views/music/tracks.js"
                    },
                    {
                        name: "PaginationPageView",
                        path: "/views/pagination/page.js"
                    },
                    {
                        name: "MusicView",
                        path: "/views/music.js"
                    }
                ],
                view: "MusicView",
                jsClass: "Music",
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {
                    css: ["/css/music.css"],
                    js: ["/views/music/tracks.js", "/views/pagination/page.js", "/js/music.js"]
                },
                MusicView.get(data),
                MusicView.getInfo(info),
                req,
                user
            ));
        }
    }
}

module.exports = Music;
