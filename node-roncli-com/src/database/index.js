const MongoDb = require("mongodb");

/**
 * @type {MongoDb.MongoClient}
 */
let client;

/**
 * @type {MongoDb.Db}
 */
let db;

//  ####   #
//   #  #  #
//   #  #  # ##
//   #  #  ##  #
//   #  #  #   #
//   #  #  ##  #
//  ####   # ##
/**
 * A class that handles setting up the database.
 */
class Db {
    //   #                     #
    //  # #                    #
    //  #    ###    ##   # #   #      ##   ###    ###
    // ###   #  #  #  #  ####  #     #  #  #  #  #  #
    //  #    #     #  #  #  #  #     #  #  #  #   ##
    //  #    #      ##   #  #  ####   ##   #  #  #
    //                                            ###
    /**
     * Converts a value from a MongoDb.Long to a number.
     * @param {MongoDb.Long|number} val The number.
     * @returns {number} The number.
     */
    static fromLong(val) {
        return typeof val === "number" ? val : val.toNumber();
    }

    //  #          #
    //  #          #
    // ###    ##   #      ##   ###    ###
    //  #    #  #  #     #  #  #  #  #  #
    //  #    #  #  #     #  #  #  #   ##
    //   ##   ##   ####   ##   #  #  #
    //                                ###
    /**
     * Converts a value from a number to a MongoDb.Long.
     * @param {MongoDb.Long|number} val The number.
     * @returns {MongoDb.Long} The number.
     */
    static toLong(val) {
        return typeof val === "number" ? MongoDb.Long.fromNumber(val) : val;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the database object.
     * @returns {Promise<MongoDb.Db>} The database.
     */
    static async get() {
        if (!client) {
            client = new MongoDb.MongoClient(`mongodb://web_roncli:${process.env.WEB_RONCLI_PASSWORD}@db:27017/roncli`, {
                authMechanism: "SCRAM-SHA-256",
                authSource: "admin",
                promoteLongs: false
            });
        }

        await client.connect();

        if (!db) {
            db = client.db("roncli");
        }

        return db;
    }
}

module.exports = Db;
