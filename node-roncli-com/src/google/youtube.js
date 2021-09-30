/**
 * @typedef {import("googleapis").youtube_v3.Schema$Playlist} Google.YouTube.Playlist
 * @typedef {import("googleapis").youtube_v3.Schema$PlaylistItem} Google.YouTube.PlaylistItem
 * @typedef {import("googleapis").youtube_v3.Schema$Video} Google.YouTube.Video
 */

const google = require("googleapis").google,

    youtube = google.youtube({
        version: "v3",
        auth: process.env.GOOGLE_API_KEY
    });

//  #   #                #####         #
//  #   #                  #           #
//   # #    ###   #   #    #    #   #  # ##    ###
//    #    #   #  #   #    #    #   #  ##  #  #   #
//    #    #   #  #   #    #    #   #  #   #  #####
//    #    #   #  #  ##    #    #  ##  ##  #  #
//    #     ###    ## #    #     ## #  # ##    ###
/**
 * A class that handles calls to Google's YouTube API.
 */
class YouTube {
    //              #    ###   ##                ##     #            #
    //              #    #  #   #                 #                  #
    //  ###   ##   ###   #  #   #     ###  #  #   #    ##     ###   ###
    // #  #  # ##   #    ###    #    #  #  #  #   #     #    ##      #
    //  ##   ##     #    #      #    # ##   # #   #     #      ##    #
    // #      ##     ##  #     ###    # #    #   ###   ###   ###      ##
    //  ###                                 #
    /**
     * Gets the playlist by its ID.
     * @param {string} id The playlist ID.
     * @returns {Promise<{playlist: Google.YouTube.Playlist, videos: Google.YouTube.PlaylistItem[]}>} A promise that returns the playlist.
     */
    static async getPlaylist(id) {
        const [playlist, videos] = await Promise.all([
            (async () => {
                const res = await youtube.playlists.list({
                    part: ["snippet"],
                    id: [id]
                });

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting a YouTube playlist from Google: status ${res.status}`);
                }

                return res.data.items[0];
            })(), (async () => {
                const res = await youtube.playlistItems.list({
                    part: ["snippet"],
                    playlistId: id
                });

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting YouTube playlist item from Google: status ${res.status}`);
                }

                return res.data.items;
            })()
        ]);

        return {playlist, videos};
    }

    //              #    #  #   #       #
    //              #    #  #           #
    //  ###   ##   ###   #  #  ##     ###   ##    ##
    // #  #  # ##   #    #  #   #    #  #  # ##  #  #
    //  ##   ##     #     ##    #    #  #  ##    #  #
    // #      ##     ##   ##   ###    ###   ##    ##
    //  ###
    /**
     * Gets the video by its ID.
     * @param {string} id The video ID.
     * @returns {Promise<Google.YouTube.Video>} A promise that returns the video.
     */
    static async getVideo(id) {
        const res = await youtube.videos.list({
            part: ["snippet"],
            id: [id]
        });

        if (res.status !== 200) {
            throw new Error(`There was an error while getting a YouTube video from Google: status ${res.status}`);
        }

        if (!res.data.items || res.data.items.length === 0) {
            return void 0;
        }

        return res.data.items[0];
    }
}

module.exports = YouTube;
