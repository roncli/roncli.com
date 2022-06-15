/**
 * @typedef {import("../models/twitter")} Twitter
 * @typedef {import("../../types/node/twitterTypes").TwitterData} TwitterTypes.TwitterData
 * @typedef {import("../../types/node/twitterTypes").TwitterMongoData} TwitterTypes.TwitterMongoData
 */

const Db = require("."),
    MongoDb = require("mongodb");

//  #####           #     #      #                   ####   #
//    #                   #      #                    #  #  #
//    #    #   #   ##    ####   ####    ###   # ##    #  #  # ##
//    #    #   #    #     #      #     #   #  ##  #   #  #  ##  #
//    #    # # #    #     #      #     #####  #       #  #  #   #
//    #    # # #    #     #  #   #  #  #      #       #  #  ##  #
//    #     # #    ###     ##     ##    ###   #      ####   # ##
/**
 * A class to handle database calls to the Twitter collection.
 */
class TwitterDb {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the Twitter data from the database.
     * @returns {Promise<TwitterTypes.TwitterData>} A promise that returns the Twitter data.
     */
    static async get() {
        const db = await Db.get();

        const twitter = await db.collection("twitter").findOne({});

        return twitter ? {
            _id: twitter._id.toHexString(),
            lastId: twitter.lastId
        } : void 0;
    }

    //  ###    ###  # #    ##
    // ##     #  #  # #   # ##
    //   ##   # ##  # #   ##
    // ###     # #   #     ##
    /**
     * Saves the Twitter data to the database.
     * @param {Twitter} twitter The Twitter data to save.
     * @returns {Promise} A promise that resolves when the Twitter data has been saved.
     */
    static async save(twitter) {
        const db = await Db.get();

        await db.collection("twitter").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(twitter.id)}, {$set: {lastId: twitter.lastId}});
    }

}

module.exports = TwitterDb;
