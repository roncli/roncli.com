/**
 * @typedef {import("../models/allowedPlaylist")} AllowedPlaylist
 * @typedef {import("../../types/node/allowedPlaylistTypes").AllowedPlaylistData} AllowedPlaylistTypes.AllowedPlaylistData
 */

const Db = require(".");

//    #     ##     ##                             #  ####    ##                   ##      #            #     ####   #
//   # #     #      #                             #  #   #    #                    #                   #      #  #  #
//  #   #    #      #     ###   #   #   ###    ## #  #   #    #     ###   #   #    #     ##     ###   ####    #  #  # ##
//  #   #    #      #    #   #  #   #  #   #  #  ##  ####     #        #  #   #    #      #    #       #      #  #  ##  #
//  #####    #      #    #   #  # # #  #####  #   #  #        #     ####  #  ##    #      #     ###    #      #  #  #   #
//  #   #    #      #    #   #  # # #  #      #  ##  #        #    #   #   ## #    #      #        #   #  #   #  #  ##  #
//  #   #   ###    ###    ###    # #    ###    ## #  #       ###    ####      #   ###    ###   ####     ##   ####   # ##
//                                                                        #   #
//                                                                         ###
/**
 * A class to handle database calls to the allowed playlist collection.
 */
class AllowedPlaylistDb {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds an allowed playlist.
     * @param {AllowedPlaylist} playlist The playlist to allow.
     * @returns {Promise} A promise that resolves when the playlist has been allowed.
     */
    static async add(playlist) {
        const db = await Db.get();

        await db.collection("allowedPlaylist").insertOne({playlistId: playlist.id});
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes the allowed playlist.
     * @param {AllowedPlaylist} playlist The playlist to delete.
     * @returns {Promise} A promise that resolves when the allowed playlist has been deleted.
     */
    static async delete(playlist) {
        const db = await Db.get();

        await db.collection("allowedPlaylist").findOneAndDelete({playlistId: playlist.id});
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets an allowed playlist from the database by its ID.
     * @param {string} id The playlist ID.
     * @returns {Promise<AllowedPlaylistTypes.AllowedPlaylistData>} A promise that returns the allowed playlist.
     */
    static async get(id) {
        const db = await Db.get();

        const data = await db.collection("allowedPlaylist").findOne({playlistId: id});

        return data || void 0;
    }

    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all allowed playlists from the database.
     * @returns {Promise<AllowedPlaylistTypes.AllowedPlaylistData[]>} A promise that returns the allowed playlists.
     */
    static async getAll() {
        const db = await Db.get();

        const data = await db.collection("allowedPlaylist").find({}).toArray();

        return data;
    }
}

module.exports = AllowedPlaylistDb;
