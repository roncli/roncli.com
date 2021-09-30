/**
 * @typedef {import("../../types/node/redirectTypes").RedirectData} RedirectTypes.RedirectData
 */

const RedirectDb = require("../database/redirect"),
    Exception = require("../errors/exception");

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
        let redirect;
        try {
            redirect = await RedirectDb.getByPath(path);
        } catch (err) {
            throw new Exception("There was an error while getting a redirect by path from the database.", err);
        }

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
}

module.exports = Redirect;
