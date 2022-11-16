/**
 * @typedef {import("../models/contact")} Contact
 * @typedef {import("../../types/node/contactTypes").ContactData} ContactTypes.ContactData
 * @typedef {import("../../types/node/contactTypes").ContactMongoData} ContactTypes.ContactMongoData
 */

const Db = require("."),
    MongoDb = require("mongodb");

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
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds a contact to the database.
     * @param {Contact} contact The contact to add.
     * @returns {Promise} A promise that resolves when the contact has been added.
     */
    static async add(contact) {
        const db = await Db.get();

        const result = await db.collection("contact").insertOne({
            title: contact.title,
            value: contact.value
        });

        contact.id = result.insertedId.toHexString();
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes a contact from the database.
     * @param {Contact} contact The contact.
     * @returns {Promise} A promise that resolves when the contact has been deleted.
     */
    static async delete(contact) {
        const db = await Db.get();

        await db.collection("contact").deleteOne({_id: MongoDb.ObjectId.createFromHexString(contact.id)});
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a contact by its ID.
     * @param {string} id The ID.
     * @returns {Promise<ContactTypes.ContactData>} A promise that returns the contact.
     */
    static async get(id) {
        const db = await Db.get();

        const contact = await db.collection("contact").findOne({_id: MongoDb.ObjectId.createFromHexString(id)});

        if (!contact) {
            return void 0;
        }

        return {
            _id: contact._id.toHexString(),
            title: contact.title,
            value: contact.value
        };
    }

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

    //              #    ###         ###    #     #    ##
    //              #    #  #         #           #     #
    //  ###   ##   ###   ###   #  #   #    ##    ###    #     ##
    // #  #  # ##   #    #  #  #  #   #     #     #     #    # ##
    //  ##   ##     #    #  #   # #   #     #     #     #    ##
    // #      ##     ##  ###     #    #    ###     ##  ###    ##
    //  ###                     #
    /**
     * Gets a contact by its title.
     * @param {string} title The title.
     * @returns {Promise<ContactTypes.ContactData>} A promise that returns the contact.
     */
    static async getByTitle(title) {
        const db = await Db.get();

        const contact = await db.collection("contact").findOne({title});

        if (!contact) {
            return void 0;
        }

        return {
            _id: contact._id.toHexString(),
            title: contact.title,
            value: contact.value
        };
    }

    //              #    ###         #  #        ##
    //              #    #  #        #  #         #
    //  ###   ##   ###   ###   #  #  #  #   ###   #    #  #   ##
    // #  #  # ##   #    #  #  #  #  #  #  #  #   #    #  #  # ##
    //  ##   ##     #    #  #   # #   ##   # ##   #    #  #  ##
    // #      ##     ##  ###     #    ##    # #  ###    ###   ##
    //  ###                     #
    /**
     * Gets a contact by its value.
     * @param {string} value The value.
     * @returns {Promise<ContactTypes.ContactData>} A promise that returns the contact.
     */
    static async getByValue(value) {
        const db = await Db.get();

        const contact = await db.collection("contact").findOne({value});

        if (!contact) {
            return void 0;
        }

        return {
            _id: contact._id.toHexString(),
            title: contact.title,
            value: contact.value
        };
    }
}

module.exports = ContactDb;
