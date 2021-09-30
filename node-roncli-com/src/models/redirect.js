/**
 * @typedef {import("../../types/node/redirectTypes").RedirectData} RedirectTypes.RedirectData
 */

const RedirectDb = require("../database/redirect");

//  ####              #    #                          #
//  #   #             #                               #
//  #   #   ###    ## #   ##    # ##    ###    ###   ####
//  ####   #   #  #  ##    #    ##  #  #   #  #   #   #
//  # #    #####  #   #    #    #      #####  #       #
//  #  #   #      #  ##    #    #      #      #   #   #  #
//  #   #   ###    ## #   ###   #       ###    ###     ##
/**
 * A class that represents a redirect.
 */
class Redirect {
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
     * @returns {Promise<Redirect>} A promise that returns the redirect.
     */
    static async get(id) {
        const redirect = await RedirectDb.get(id);

        if (!redirect) {
            return void 0;
        }

        return new Redirect(redirect);
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
     * @returns {Promise<Redirect[]>} A promise that returns the redirects.
     */
    static async getAll() {
        const redirects = await RedirectDb.getAll();

        return redirects.sort((a, b) => a.fromPath.localeCompare(b.fromPath)).map((r) => new Redirect(r));
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
     * @returns {Promise<Redirect>} A promise that returns the redirect.
     */
    static async getByPath(path) {
        const redirect = await RedirectDb.getByPath(path);

        if (!redirect) {
            return void 0;
        }

        return new Redirect(redirect);
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new redirect object.
     * @param {RedirectTypes.RedirectData} redirect The redirect.
     */
    constructor(redirect) {
        this.id = redirect._id;
        this.fromPath = redirect.fromPath;
        this.toUrl = redirect.toUrl;
        this.dateAdded = redirect.dateAdded;
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds the redirect to the database.
     * @returns {Promise} A promise that resolves when the redirect has been added.
     */
    async add() {
        await RedirectDb.add(this);
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes the redirect from the database.
     * @returns {Promise} A promise that resolves when the redirect has been deleted.
     */
    async delete() {
        await RedirectDb.delete(this);
    }
}

module.exports = Redirect;
