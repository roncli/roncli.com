/**
 * @typedef {import("../../types/node/redirectTypes").RedirectData} RedirectTypes.RedirectData
 * @typedef {import("../../types/node/redirectTypes").RedirectMongoData} RedirectTypes.RedirectMongoData
 */

const Db = require(".");

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
