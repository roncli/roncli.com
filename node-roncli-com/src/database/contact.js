/**
 * @typedef {import("../../types/node/contactTypes").ContactData} ContactTypes.ContactData
 * @typedef {import("../../types/node/contactTypes").ContactMongoData} ContactTypes.ContactMongoData
 */

const Db = require(".");

//   ###                  #                    #     ####   #
//  #   #                 #                    #      #  #  #
//  #       ###   # ##   ####    ###    ###   ####    #  #  # ##
//  #      #   #  ##  #   #         #  #   #   #      #  #  ##  #
//  #      #   #  #   #   #      ####  #       #      #  #  #   #
//  #   #  #   #  #   #   #  #  #   #  #   #   #  #   #  #  ##  #
//   ###    ###   #   #    ##    ####   ###     ##   ####   # ##
/**
 * A class to handle database calls to the contact collection.
 */
class ContactDb {
    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all contacts from the database.
     * @returns {Promise<ContactTypes.ContactData[]>} A promise that returns the contacts.
     */
    static async getAll() {
        const db = await Db.get();

        const contacts = await db.collection("contact").find({}).toArray();

        return contacts.map((c) => ({
            _id: c._id.toHexString(),
            title: c.title,
            value: c.value
        }));
    }
}

module.exports = ContactDb;
