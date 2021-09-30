/**
 * @typedef {import("../../types/node/necrodancerTypes").ToofzData} NecroDancerTypes.ToofzData
 */

const request = require("@root/request");

//  #####                  ##
//    #                   #  #
//    #     ###    ###    #     #####
//    #    #   #  #   #  ####      #
//    #    #   #  #   #   #       #
//    #    #   #  #   #   #      #
//    #     ###    ###    #     #####
/**
 * A class that handles calls to Toofz's API.
 */
class Toofz {
    //              #    ###   ##
    //              #    #  #   #
    //  ###   ##   ###   #  #   #     ###  #  #   ##   ###
    // #  #  # ##   #    ###    #    #  #  #  #  # ##  #  #
    //  ##   ##     #    #      #    # ##   # #  ##    #
    // #      ##     ##  #     ###    # #    #    ##   #
    //  ###                                 #
    /**
     * Gets the player data from Toofz.
     * @returns {Promise<NecroDancerTypes.ToofzData>} A promise that returns the player data.
     */
    static async getPlayer() {
        const res = await request.get({
            uri: "https://api.toofz.com/players/76561197996696153/entries?products=amplified&production=true",
            json: true
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting player data from Toofz: status ${res.statusCode}`);
        }

        return res.body;
    }
}

module.exports = Toofz;
