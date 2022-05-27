const Discord = require("../discord"),
    DiscordListener = require("./discord");

//  #        #            #
//  #                     #
//  #       ##     ###   ####    ###   # ##    ###   # ##    ###
//  #        #    #       #     #   #  ##  #  #   #  ##  #  #
//  #        #     ###    #     #####  #   #  #####  #       ###
//  #        #        #   #  #  #      #   #  #      #          #
//  #####   ###   ####     ##    ###   #   #   ###   #      ####
/**
 * A class that sets up listening to eventEmitters.
 */
class Listeners {
    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Sets up the listeners for Discord.
     * @returns {void}
     */
    static setup() {
        Object.getOwnPropertyNames(DiscordListener).filter((property) => typeof DiscordListener[property] === "function").forEach((property) => {
            Discord.events.on(property, DiscordListener[property]);
        });
    }
}

module.exports = Listeners;
