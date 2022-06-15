/**
 * @typedef {import("../../types/node/twitterTypes").TwitterData} TwitterTypes.TwitterData
 */

const TwitterDb = require("../database/twitter");

//  #####           #     #      #
//    #                   #      #
//    #    #   #   ##    ####   ####    ###   # ##
//    #    #   #    #     #      #     #   #  ##  #
//    #    # # #    #     #      #     #####  #
//    #    # # #    #     #  #   #  #  #      #
//    #     # #    ###     ##     ##    ###   #
/**
 * A class that represents Twitter data.
 */
class Twitter {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the Twitter data.
     * @returns {Promise<Twitter>} A promise that returns the Twitter data.
     */
    static async get() {
        const data = await TwitterDb.get();

        return data ? new Twitter(data) : void 0;
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new Twitter object.
     * @param {TwitterTypes.TwitterData} data The Twitter data.
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
     * Saves the Twitter data.
     * @returns {Promise} A promise that resolves when the Twitter data is saved.
     */
    async save() {
        await TwitterDb.save(this);
    }
}

module.exports = Twitter;
