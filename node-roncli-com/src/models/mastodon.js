/**
 * @typedef {import("../../types/node/mastodonTypes").MastodonData} MastodonTypes.MastodonData
 */

const MastodonDb = require("../database/mastodon");

//  #   #                 #                #
//  #   #                 #                #
//  ## ##   ###    ###   ####    ###    ## #   ###   # ##
//  # # #      #  #       #     #   #  #  ##  #   #  ##  #
//  #   #   ####   ###    #     #   #  #   #  #   #  #   #
//  #   #  #   #      #   #  #  #   #  #  ##  #   #  #   #
//  #   #   ####  ####     ##    ###    ## #   ###   #   #
/**
 * A class that represents Mastodon data.
 */
class Mastodon {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the Mastodon data.
     * @returns {Promise<Mastodon>} A promise that returns the Mastodon data.
     */
    static async get() {
        const data = await MastodonDb.get();

        return data ? new Mastodon(data) : void 0;
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new Mastodon object.
     * @param {MastodonTypes.MastodonData} data The Mastodon data.
     */
    constructor(data) {
        this.id = data._id;
        this.lastId = data.lastId;
    }

    //  ###    ###  # #    ##
    // ##     #  #  # #   # ##
    //   ##   # ##  # #   ##
    // ###     # #   #     ##
    /**
     * Saves the Mastodon data.
     * @returns {Promise} A promise that resolves when the Mastodon data is saved.
     */
    async save() {
        await MastodonDb.save(this);
    }
}

module.exports = Mastodon;
