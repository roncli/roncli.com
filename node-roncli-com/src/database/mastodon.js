/**
 * @typedef {import("../models/mastodon")} Mastodon
 * @typedef {import("../../types/node/mastodonTypes").MastodonData} MastodonTypes.MastodonData
 * @typedef {import("../../types/node/mastodonTypes").MastodonMongoData} MastodonTypes.MastodonMongoData
 */

const Db = require("."),
    MongoDb = require("mongodb");

//  #   #                 #                #                ####   #
//  #   #                 #                #                 #  #  #
//  ## ##   ###    ###   ####    ###    ## #   ###   # ##    #  #  # ##
//  # # #      #  #       #     #   #  #  ##  #   #  ##  #   #  #  ##  #
//  #   #   ####   ###    #     #   #  #   #  #   #  #   #   #  #  #   #
//  #   #  #   #      #   #  #  #   #  #  ##  #   #  #   #   #  #  ##  #
//  #   #   ####  ####     ##    ###    ## #   ###   #   #  ####   # ##
/**
 * A class to handle database calls to the Mastodon collection.
 */
class MastodonDb {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the Mastodon data from the database.
     * @returns {Promise<MastodonTypes.MastodonData>} A promise that returns the Mastodon data.
     */
    static async get() {
        const db = await Db.get();

        const mastodon = await db.collection("mastodon").findOne({});

        return mastodon ? {
            _id: mastodon._id.toHexString(),
            lastId: mastodon.lastId
        } : void 0;
    }

    //  ###    ###  # #    ##
    // ##     #  #  # #   # ##
    //   ##   # ##  # #   ##
    // ###     # #   #     ##
    /**
     * Saves the Mastodon data to the database.
     * @param {Mastodon} mastodon The Mastodon data to save.
     * @returns {Promise} A promise that resolves when the Mastodon data has been saved.
     */
    static async save(mastodon) {
        const db = await Db.get();

        await db.collection("mastodon").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(mastodon.id)}, {$set: {lastId: mastodon.lastId}});
    }

}

module.exports = MastodonDb;
