/**
 * @typedef {import("../../types/node/changeAuthorizationTypes").ChangeAuthorizationData} ChangeAuthorizationTypes.ChangeAuthorizationData
 * @typedef {import("../../types/node/changeAuthorizationTypes").ChangeAuthorizationMongoData} ChangeAuthorizationTypes.ChangeAuthorizationMongoData
 * @typedef {import("../models/user")} User
 */

const Db = require("."),
    Hashing = require("./hashing"),
    MongoDb = require("mongodb");

//   ###   #                                    #            #     #                      #                   #       #                  ####   ####
//  #   #  #                                   # #           #     #                                          #                           #  #   #  #
//  #      # ##    ###   # ##    ## #   ###   #   #  #   #  ####   # ##    ###   # ##    ##    #####   ###   ####    ##     ###   # ##    #  #   #  #
//  #      ##  #      #  ##  #  #  #   #   #  #   #  #   #   #     ##  #  #   #  ##  #    #       #       #   #       #    #   #  ##  #   #  #   ###
//  #      #   #   ####  #   #   ##    #####  #####  #   #   #     #   #  #   #  #        #      #     ####   #       #    #   #  #   #   #  #   #  #
//  #   #  #   #  #   #  #   #  #      #      #   #  #  ##   #  #  #   #  #   #  #        #     #     #   #   #  #    #    #   #  #   #   #  #   #  #
//   ###   #   #   ####  #   #   ###    ###   #   #   ## #    ##   #   #   ###   #       ###   #####   ####    ##    ###    ###   #   #  ####   ####
//                              #   #
//                               ###
/**
 * A class to handle database calls to the change authorization collection.
 */
class ChangeAuthorizationDB {
    //                          #
    //                          #
    //  ##   ###    ##    ###  ###    ##
    // #     #  #  # ##  #  #   #    # ##
    // #     #     ##    # ##   #    ##
    //  ##   #      ##    # #    ##   ##
    /**
     * Creates a change authorization request for a user.
     * @param {User} user The user.
     * @param {"password" | "emailChange" | "emailValidate" | "register"} type The type of change authorization.
     * @param {object} [data] The optional object to include.
     * @returns {Promise<{changeAuthorization: ChangeAuthorizationTypes.ChangeAuthorizationData, authorizationCode: string}>} A promise that returns the change authorization request.
     */
    static async create(user, type, data) {
        const db = await Db.get(),
            code = Hashing.getSalt(),
            salt = Hashing.getSalt(),
            hash = await Hashing.getHash(code, salt);

        const doc = {
            userId: MongoDb.ObjectId.createFromHexString(user.id),
            type,
            authorization: {salt, hash},
            dateAdded: new Date()
        };

        if (data) {
            doc.data = data;
        }

        const authorizationData = await db.collection("changeAuthorization").insertOne(doc);

        if (!authorizationData.acknowledged) {
            return void 0;
        }

        return {
            changeAuthorization: {
                _id: authorizationData.insertedId.toHexString(),
                userId: user.id,
                type,
                authorization: doc.authorization,
                data,
                dateAdded: doc.dateAdded
            },
            authorizationCode: code
        };
    }

    //              #            #           ####              #  #
    //                           #           #                 #  #
    //  ##   #  #  ##     ###   ###    ###   ###    ##   ###   #  #   ###    ##   ###
    // # ##   ##    #    ##      #    ##     #     #  #  #  #  #  #  ##     # ##  #  #
    // ##     ##    #      ##    #      ##   #     #  #  #     #  #    ##   ##    #
    //  ##   #  #  ###   ###      ##  ###    #      ##   #      ##   ###     ##   #
    /**
     * Returns whether a type of change authorization exists for a user.
     * @param {User} user The user.
     * @param {"password" | "emailChange" | "emailValidate" | "register"} type The type of change authorization.
     * @returns {Promise<boolean>} A promise that returns whether the change authorization exists for a user.
     */
    static async existsForUser(user, type) {
        const db = await Db.get();

        const data = await db.collection("changeAuthorization").findOne({userId: MongoDb.ObjectId.createFromHexString(user.id), type});

        return !!data;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a change authorization record by user ID, code, and type.
     * @param {string} userId The user ID.
     * @param {string} code The authorization code.
     * @param {"password" | "emailChange" | "emailValidate" | "register"} type The type of change authorization.
     * @returns {Promise<ChangeAuthorizationTypes.ChangeAuthorizationData>} A promise that returns the change authroization data.
     */
    static async get(userId, code, type) {
        const db = await Db.get();

        const data = await db.collection("changeAuthorization").findOne({userId: MongoDb.ObjectId.createFromHexString(userId), type});

        if (!data || await Hashing.getHash(code, data.authorization.salt) !== data.authorization.hash) {
            return void 0;
        }

        return {
            _id: data._id.toHexString(),
            userId: data.userId.toHexString(),
            type: data.type,
            authorization: data.authorization,
            data: data.data,
            dateAdded: data.dateAdded
        };
    }

    //                                     ###         #  #                      ##            #  ###
    //                                     #  #        #  #                     #  #           #   #
    // ###    ##   # #    ##   # #    ##   ###   #  #  #  #   ###    ##   ###   #  #  ###    ###   #    #  #  ###    ##
    // #  #  # ##  ####  #  #  # #   # ##  #  #  #  #  #  #  ##     # ##  #  #  ####  #  #  #  #   #    #  #  #  #  # ##
    // #     ##    #  #  #  #  # #   ##    #  #   # #  #  #    ##   ##    #     #  #  #  #  #  #   #     # #  #  #  ##
    // #      ##   #  #   ##    #     ##   ###     #    ##   ###     ##   #     #  #  #  #   ###   #      #   ###    ##
    //                                            #                                                      #    #
    /**
     * Removes change authorization requests of a single type for a user.
     * @param {User} user The user.
     * @param {"password" | "emailChange" | "emailValidate" | "register"} type The type of change authorization.
     * @returns {Promise} A promise that resolves when the authorization has been removed.
     */
    static async removeByUserAndType(user, type) {
        const db = await Db.get();

        return db.collection("changeAuthorization").deleteMany({userId: MongoDb.ObjectId.createFromHexString(user.id), type});
    }
}

module.exports = ChangeAuthorizationDB;
