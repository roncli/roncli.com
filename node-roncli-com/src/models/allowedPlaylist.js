/**
 * @typedef {import("../../types/node/allowedPlaylistTypes").AllowedPlaylistData} AllowedPlaylistTypes.AllowedPlaylistData
 */

const AllowedPlaylistDb = require("../database/allowedPlaylist");

//    #     ##     ##                             #  ####    ##                   ##      #            #
//   # #     #      #                             #  #   #    #                    #                   #
//  #   #    #      #     ###   #   #   ###    ## #  #   #    #     ###   #   #    #     ##     ###   ####
//  #   #    #      #    #   #  #   #  #   #  #  ##  ####     #        #  #   #    #      #    #       #
//  #####    #      #    #   #  # # #  #####  #   #  #        #     ####  #  ##    #      #     ###    #
//  #   #    #      #    #   #  # # #  #      #  ##  #        #    #   #   ## #    #      #        #   #  #
//  #   #   ###    ###    ###    # #    ###    ## #  #       ###    ####      #   ###    ###   ####     ##
//                                                                        #   #
//                                                                         ###
/**
 * A class that represents an allowed playlist.
 */
class AllowedPlaylist {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets an allowed playlist by its ID.
     * @param {string} id The playlist ID.
     * @returns {Promise<AllowedPlaylist>} A promise that returns the allowed playlist.
     */
    static async get(id) {
        const data = await AllowedPlaylistDb.get(id);

        if (!data) {
            return void 0;
        }

        return new AllowedPlaylist(data);
    }

    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all allowed playlists.
     * @returns {Promise<AllowedPlaylist[]>} A promise that returns the allowed playlists.
     */
    static async getAll() {
        const data = await AllowedPlaylistDb.getAll();

        return data.map((d) => new AllowedPlaylist(d));
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new allowed playlist object.
     * @param {AllowedPlaylistTypes.AllowedPlaylistData} data The allowed playlist data.
     */
    constructor(data) {
        this.id = data.playlistId;
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds an allowed playlist.
     * @returns {Promise} A promise that resolves when the playlist has been allowed.
     */
    add() {
        return AllowedPlaylistDb.add(this);
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes the allowed playlist.
     * @returns {Promise} A promise that resolves when the allowed playlist has been deleted.
     */
    delete() {
        return AllowedPlaylistDb.delete(this);
    }
}

module.exports = AllowedPlaylist;
