/**
 * @typedef {import("../../types/node/speedrunTypes").SpeedrunData} SpeedrunTypes.SpeedrunData
 * @typedef {import("../../types/node/speedrunTypes").VariableData} SpeedrunTypes.VariableData
 */

const request = require("@root/request");

//   ###                            #                        ###
//  #   #                           #                       #   #
//  #      # ##    ###    ###    ## #  # ##   #   #  # ##   #       ###   ## #
//   ###   ##  #  #   #  #   #  #  ##  ##  #  #   #  ##  #  #      #   #  # # #
//      #  ##  #  #####  #####  #   #  #      #   #  #   #  #      #   #  # # #
//  #   #  # ##   #      #      #  ##  #      #  ##  #   #  #   #  #   #  # # #
//   ###   #       ###    ###    ## #  #       ## #  #   #   ###    ###   #   #
//         #
//         #
/**
 * A class that handles calls to speedrun.com's API.
 */
class SpeedrunCom {
    //              #     ##                        #
    //              #    #  #                       #
    //  ###   ##   ###    #    ###    ##    ##    ###  ###   #  #  ###    ###
    // #  #  # ##   #      #   #  #  # ##  # ##  #  #  #  #  #  #  #  #  ##
    //  ##   ##     #    #  #  #  #  ##    ##    #  #  #     #  #  #  #    ##
    // #      ##     ##   ##   ###    ##    ##    ###  #      ###  #  #  ###
    //  ###                    #
    /**
     * Gets the speedruns from speedrun.com.
     * @returns {Promise<SpeedrunTypes.SpeedrunData[]>} A promise that returns the speedruns.
     */
    static async getSpeedruns() {
        const res = await request.get({
            uri: "https://www.speedrun.com/api/v1/users/zxz93798/personal-bests?embed=game,category",
            json: true
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting speedruns from speedrun.com: status ${res.statusCode}`);
        }

        if (!res.body.data || res.body.data.length === 0) {
            return [];
        }

        return res.body.data;
    }

    //              #    #  #               #          #     ##
    //              #    #  #                          #      #
    //  ###   ##   ###   #  #   ###  ###   ##     ###  ###    #     ##    ###
    // #  #  # ##   #    #  #  #  #  #  #   #    #  #  #  #   #    # ##  ##
    //  ##   ##     #     ##   # ##  #      #    # ##  #  #   #    ##      ##
    // #      ##     ##   ##    # #  #     ###    # #  ###   ###    ##   ###
    //  ###
    /**
     * Gets the variables for a game.
     * @param {string} gameId The game ID.
     * @returns {Promise<SpeedrunTypes.VariableData[]>} A promise that returns the variables.
     */
    static async getVariables(gameId) {
        const res = await request.get({
            uri: `https://www.speedrun.com/api/v1/games/${gameId}/variables`,
            json: true
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting variables from speedrun.com: status ${res.statusCode}`);
        }

        if (!res.body.data || res.body.data.length === 0) {
            return [];
        }

        return res.body.data;
    }
}

module.exports = SpeedrunCom;
