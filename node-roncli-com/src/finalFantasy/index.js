const XIVAPI = require("@xivapi/js");

//  #####    #                   ##    #####                 #
//  #                             #    #                     #
//  #       ##    # ##    ###     #    #       ###   # ##   ####    ###    ###   #   #
//  ####     #    ##  #      #    #    ####       #  ##  #   #         #  #      #   #
//  #        #    #   #   ####    #    #       ####  #   #   #      ####   ###   #  ##
//  #        #    #   #  #   #    #    #      #   #  #   #   #  #  #   #      #   ## #
//  #       ###   #   #   ####   ###   #       ####  #   #    ##    ####  ####       #
//                                                                               #   #
//                                                                                ###
/**
 * A class that handles calls to Final Fantasy 14's API.
 */
class FinalFantasy {
    //              #     ##   #                              #
    //              #    #  #  #                              #
    //  ###   ##   ###   #     ###    ###  ###    ###   ##   ###    ##   ###
    // #  #  # ##   #    #     #  #  #  #  #  #  #  #  #      #    # ##  #  #
    //  ##   ##     #    #  #  #  #  # ##  #     # ##  #      #    ##    #
    // #      ##     ##   ##   #  #   # #  #      # #   ##     ##   ##   #
    //  ###
    /**
     * Gets the character.
     * @returns {Promise<any>} A promise that returns the Final Fantasy 14 character.
     */
    static getCharacter() {
        const xiv = new XIVAPI({
            "private_key": process.env.XIVAPI_API_KEY,
            "snake_case": true
        });

        return xiv.character.get(24333293, {
            extended: true,
            data: "FC,AC"
        });
    }
}

module.exports = FinalFantasy;
