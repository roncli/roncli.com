/**
 * @typedef {import("../models/redirect")} Redirect
 * @typedef {import("../../types/node/redirectTypes").RedirectData} RedirectTypes.RedirectData
 * @typedef {import("../../types/node/redirectTypes").RedirectMongoData} RedirectTypes.RedirectMongoData
 */

const Db = require("."),
    MongoDb = require("mongodb");

//  ####              #    #                          #     ####   #
//  #   #             #                               #      #  #  #
//  #   #   ###    ## #   ##    # ##    ###    ###   ####    #  #  # ##
//  ####   #   #  #  ##    #    ##  #  #   #  #   #   #      #  #  ##  #
//  # #    #####  #   #    #    #      #####  #       #      #  #  #   #
//  #  #   #      #  ##    #    #      #      #   #   #  #   #  #  ##  #
//  #   #   ###    ## #   ###   #       ###    ###     ##   ####   # ##
/**
 * A class to handle database calls to the redirect collection.
 */
class RedirectDb {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds a new redirect.
     * @param {Redirect} redirect The redirect to add.
     * @returns {Promise} A promise that resolves when the redirect has been added.
     */
    static async add(redirect) {
        const db = await Db.get();

        const result = await db.collection("redirect").insertOne({
            fromPath: redirect.fromPath,
            toUrl: redirect.toUrl,
            dateAdded: redirect.dateAdded
        });

        if (result.acknowledged) {
            redirect.id = result.insertedId.toHexString();
        }
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes a redirect.
     * @param {Redirect} redirect The redirect to delete.
     * @returns {Promise} A promise that resolves when the redirect has been deleted.
     */
    static async delete(redirect) {
        const db = await Db.get();

        await db.collection("redirect").deleteOne({_id: MongoDb.ObjectId.createFromHexString(redirect.id)});
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a redirect by its ID.
     * @param {string} id The redirect ID.
     * @returns {Promise<RedirectTypes.RedirectData>} A promise that returns the redirect.
     */
    static async get(id) {
        const db = await Db.get();

        const redirect = await db.collection("redirect").findOne({_id: MongoDb.ObjectId.createFromHexString(id)});

        return redirect ? {
            _id: redirect._id.toHexString(),
            fromPath: redirect.fromPath,
            toUrl: redirect.toUrl,
            dateAdded: redirect.dateAdded
        } : void 0;
    }

    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all redirects.
     * @returns {Promise<RedirectTypes.RedirectData[]>} A promise that returns the redirects.
     */
    static async getAll() {
        const db = await Db.get();

        const redirects = await db.collection("redirect").find({}).toArray();

        return redirects.map((r) => ({
            _id: r._id.toHexString(),
            fromPath: r.fromPath,
            toUrl: r.toUrl,
            dateAdded: r.dateAdded
        }));
    }

    //              #    ###         ###          #    #
    //              #    #  #        #  #         #    #
    //  ###   ##   ###   ###   #  #  #  #   ###  ###   ###
    // #  #  # ##   #    #  #  #  #  ###   #  #   #    #  #
    //  ##   ##     #    #  #   # #  #     # ##   #    #  #
    // #      ##     ##  ###     #   #      # #    ##  #  #
    //  ###                     #
    /**
     * Gets the redirect by path.
     * @param {string} path The path to get the redirect for.
     * @returns {Promise<RedirectTypes.RedirectData>} A promise that returns the redirect.
     */
    static async getByPath(path) {
        const db = await Db.get();

        const redirect = await db.collection("redirect").findOne({fromPath: path});

        return redirect ? {
            _id: redirect._id.toHexString(),
            fromPath: redirect.fromPath,
            toUrl: redirect.toUrl,
            dateAdded: redirect.dateAdded
        } : void 0;
    }
}

module.exports = RedirectDb;
