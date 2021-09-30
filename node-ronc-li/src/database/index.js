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
