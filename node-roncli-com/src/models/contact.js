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
}

module.exports = Contact;
