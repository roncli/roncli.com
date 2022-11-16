/**
 * @typedef {import("../../types/node/contactTypes").ContactData} ContactTypes.ContactData
 */

const ContactDb = require("../database/contact"),
    Log = require("@roncli/node-application-insights-logger");

//   ###                  #                    #
//  #   #                 #                    #
//  #       ###   # ##   ####    ###    ###   ####
//  #      #   #  ##  #   #         #  #   #   #
//  #      #   #  #   #   #      ####  #       #
//  #   #  #   #  #   #   #  #  #   #  #   #   #  #
//   ###    ###   #   #    ##    ####   ###     ##
/**
 * A class that represents a contact.
 */
class Contact {
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
     * @returns {Promise<Contact>} A promise that returns the contact.
     */
    static async get(id) {
        const data = await ContactDb.get(id);

        if (!data) {
            return void 0;
        }

        return new Contact(data);
    }

    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all contacts.
     * @returns {Promise<Contact[]>} A promise that returns the contacts.
     */
    static async getAll() {
        try {
            return (await ContactDb.getAll()).map((c) => new Contact(c)).sort((a, b) => a.title.localeCompare(b.title));
        } catch (err) {
            Log.error("There was an error while getting all contacts.", {err});
            return [];
        }
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
     * @returns {Promise<Contact>} A promise that returns the contact.
     */
    static async getByTitle(title) {
        const data = await ContactDb.getByTitle(title);

        if (!data) {
            return void 0;
        }

        return new Contact(data);
    }

    //              #    ###         #  #        ##
    //              #    #  #        #  #         #
    //  ###   ##   ###   ###   #  #  #  #   ###   #    #  #   ##
    // #  #  # ##   #    #  #  #  #  #  #  #  #   #    #  #  # ##
    //  ##   ##     #    #  #   # #   ##   # ##   #    #  #  ##
    // #      ##     ##  ###     #    ##    # #  ###    ###   ##
    //  ###                     #
    /**
     * Gets a contact by its path.
     * @param {string} value The path.
     * @returns {Promise<Contact>} A promise that returns the contact.
     */
    static async getByValue(value) {
        const data = await ContactDb.getByValue(value);

        if (!data) {
            return void 0;
        }

        return new Contact(data);
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new contact object.
     * @param {ContactTypes.ContactData} data The contact data.
     */
    constructor(data) {
        this.id = data._id;
        this.title = data.title;
        this.value = data.value;
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds the contact.
     * @returns {Promise} A promise that resolves when the contact has been added.
     */
    async add() {
        await ContactDb.add(this);
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes the contact.
     * @returns {Promise} A promise that resolves when the contact has been deleted.
     */
    async delete() {
        await ContactDb.delete(this);
    }
}

module.exports = Contact;
