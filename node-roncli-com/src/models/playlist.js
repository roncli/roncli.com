const AllowedPlaylist = require("./allowedPlaylist"),
    Cache = require("node-redis").Cache,
    Log = require("node-application-insights-logger"),
    YouTube = require("../google/youtube");

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
 * A class that represents a YouTube playlist.
 */
class Playlist {
    //                   #           # #               ###         #           ###   ##                ##     #            #
    //                   #           # #                #          #           #  #   #                 #                  #
    //  ##    ###   ##   ###    ##   # #    ##   #  #   #    #  #  ###    ##   #  #   #     ###  #  #   #    ##     ###   ###
    // #     #  #  #     #  #  # ##   #    #  #  #  #   #    #  #  #  #  # ##  ###    #    #  #  #  #   #     #    ##      #
    // #     # ##  #     #  #  ##     #    #  #  #  #   #    #  #  #  #  ##    #      #    # ##   # #   #     #      ##    #
    //  ##    # #   ##   #  #   ##    #     ##    ###   #     ###  ###    ##   #     ###    # #    #   ###   ###   ###      ##
    //                                                                                            #
    /**
     * Caches a YouTube playlist by its ID.
     * @param {string} id The playlist ID.
     * @returns {Promise} A promise that resolves when the playlist has been cached.
     */
    static async cacheYouTubePlaylist(id) {
        // Get the playlist from YouTube.
        const data = await YouTube.getPlaylist(id);

        // Cache the playlist.
        await Cache.add(`${process.env.REDIS_PREFIX}:youtube:playlist:${id}`, {
            id: data.playlist.id,
            title: data.playlist.snippet.title,
            channelId: data.playlist.snippet.channelId,
            channelTitle: data.playlist.snippet.channelTitle,
            description: data.playlist.snippet.description,
            videos: data.videos.sort((a, b) => a.snippet.position - b.snippet.position).map((v) => ({
                id: v.snippet.resourceId.videoId,
                title: v.snippet.title
            }))
        });
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a playlist by its ID.
     * @param {string} id The ID.
     * @returns {Promise<Playlist>} A promise that returns the playlist.
     */
    static async get(id) {
        try {
            if (!await AllowedPlaylist.get(id)) {
                return void 0;
            }

            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:youtube:playlist:${id}`])) {
                await Playlist.cacheYouTubePlaylist(id);
            }

            const playlist = await Cache.get(`${process.env.REDIS_PREFIX}:youtube:playlist:${id}`);

            return playlist ? new Playlist(playlist) : void 0;
        } catch (err) {
            Log.error("There was an error while getting a playlist.", {err});
            return void 0;
        }
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new playlist object.
     * @param {any} data The playlist data.
     */
    constructor(data) {
        /** @type {string} */
        this.id = data.id;

        /** @type {string} */
        this.title = data.title;

        /** @type {string} */
        this.channelId = data.channelId;

        /** @type {string} */
        this.channelTitle = data.channelTitle;

        /** @type {string} */
        this.description = data.description;

        /** @type {{id: string, title: string}[]} */
        this.videos = data.videos;
    }
}

module.exports = Playlist;
