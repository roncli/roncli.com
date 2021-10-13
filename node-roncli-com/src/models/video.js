const Cache = require("@roncli/node-redis").Cache,
    Log = require("@roncli/node-application-insights-logger"),
    YouTube = require("../google/youtube");

//  #   #    #        #
//  #   #             #
//  #   #   ##     ## #   ###    ###
//   # #     #    #  ##  #   #  #   #
//   # #     #    #   #  #####  #   #
//   # #     #    #  ##  #      #   #
//    #     ###    ## #   ###    ###
/**
 * A class that represents a YouTube video.
 */
class Video {
    //                   #           # #               ###         #           #  #   #       #
    //                   #           # #                #          #           #  #           #
    //  ##    ###   ##   ###    ##   # #    ##   #  #   #    #  #  ###    ##   #  #  ##     ###   ##    ##
    // #     #  #  #     #  #  # ##   #    #  #  #  #   #    #  #  #  #  # ##  #  #   #    #  #  # ##  #  #
    // #     # ##  #     #  #  ##     #    #  #  #  #   #    #  #  #  #  ##     ##    #    #  #  ##    #  #
    //  ##    # #   ##   #  #   ##    #     ##    ###   #     ###  ###    ##    ##   ###    ###   ##    ##
    /**
     * Caches a single YouTube video by its ID.
     * @param {string} id The video ID.
     * @returns {Promise} A promise that resolves when the video has been cached.
     */
    static async cacheYouTubeVideo(id) {
        // Get the video from YouTube.
        const video = await YouTube.getVideo(id);

        // Cache the video.
        await Cache.add(`${process.env.REDIS_PREFIX}:youtube:video:${id}`, {
            id: video.id,
            channelTitle: video.snippet.channelTitle,
            title: video.snippet.title
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
     * Gets a video by its ID.
     * @param {string} id The ID.
     * @returns {Promise<Video>} A promise that returns the video.
     */
    static async get(id) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:youtube:video:${id}`])) {
                await Video.cacheYouTubeVideo(id);
            }

            const video = await Cache.get(`${process.env.REDIS_PREFIX}:youtube:video:${id}`);

            return video ? new Video(video) : void 0;
        } catch (err) {
            Log.error("There was an error while getting a video.", {err});
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
     * Creates a new video object.
     * @param {any} data The video data.
     */
    constructor(data) {
        /** @type {string} */
        this.id = data.id;

        /** @type {string} */
        this.channelTitle = data.channelTitle;

        /** @type {string} */
        this.title = data.title;
    }
}

module.exports = Video;
