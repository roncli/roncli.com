/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminYouTubeView = require("../../public/views/adminYouTube"),
    AllowedPlaylist = require("../../src/models/allowedPlaylist"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");


//    #        #           #           #   #                #####         #
//   # #       #                       #   #                  #           #
//  #   #   ## #  ## #    ##    # ##    # #    ###   #   #    #    #   #  # ##    ###
//  #   #  #  ##  # # #    #    ##  #    #    #   #  #   #    #    #   #  ##  #  #   #
//  #####  #   #  # # #    #    #   #    #    #   #  #   #    #    #   #  #   #  #####
//  #   #  #  ##  # # #    #    #   #    #    #   #  #  ##    #    #  ##  ##  #  #
//  #   #   ## #  #   #   ###   #   #    #     ###    ## #    #     ## #  # ##    ###
/**
 * A class that represents the admin YouTube page.
 */
class AdminYouTube extends RouterBase {
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

        route.path = "/admin/youtube";

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
        const user = await User.getCurrent(req);

        if (!user || !await user.is("SiteAdmin")) {
            await Common.notFound(req, res, user);
            return;
        }

        const data = {playlists: (await AllowedPlaylist.getAll()).sort((a, b) => a.id.localeCompare(b.id))};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "YouTube - Admin - roncli.com",
                css: [],
                js: ["/js/adminYouTube.js"],
                views: [
                    {
                        name: "AdminYouTubeView",
                        path: "/views/adminYouTube.js"
                    }
                ],
                view: "AdminYouTubeView",
                jsClass: "AdminYouTube",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>YouTube - Admin - roncli.com</title>
                    <meta name="og:description" content="Manage the YouTube playlists on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="YouTube Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Manage the YouTube playlists on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="YouTube Admin" />
                `,
                void 0,
                {js: ["/js/adminYouTube.js"]},
                AdminYouTubeView.get(data),
                AdminYouTubeView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminYouTube;
