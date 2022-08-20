/**
 * @typedef {{name: string, defaultvalue: number, displayName: string, hidden: number, description: string, icon: string, icongray: string}} SteamAPI.Achievement
 * @typedef {Awaited<ReturnType<import("steamapi")["getUserOwnedGames"]>>[number]} SteamAPI.Game
 * @typedef {Awaited<ReturnType<import("steamapi")["getGameDetails"]>>} SteamAPI.GameDetails
 * @typedef {Awaited<ReturnType<import("steamapi")["getUserAchievements"]>>} SteamAPI.PlayerAchievements
 */

const SteamApi = require("steamapi");

//   ###    #
//  #   #   #
//  #      ####    ###    ###   ## #
//   ###    #     #   #      #  # # #
//      #   #     #####   ####  # # #
//  #   #   #  #  #      #   #  # # #
//   ###     ##    ###    ####  #   #
/**
 * A class that handles calls to Steam's API.
 */
class Steam {
    //              #     ##                        #   ##
    //              #    #  #                       #  #  #
    //  ###   ##   ###   #  #  #  #  ###    ##    ###  #      ###  # #    ##    ###
    // #  #  # ##   #    #  #  #  #  #  #  # ##  #  #  # ##  #  #  ####  # ##  ##
    //  ##   ##     #    #  #  ####  #  #  ##    #  #  #  #  # ##  #  #  ##      ##
    // #      ##     ##   ##   ####  #  #   ##    ###   ###   # #  #  #   ##   ###
    //  ###
    /**
     * Gets the list of owned games from Steam.
     * @returns {Promise<SteamAPI.Game[]>} A promise that returns the owned games.
     */
    static getOwnedGames() {
        const steam = new SteamApi(process.env.STEAM_API_KEY);

        return steam.getUserOwnedGames(process.env.STEAM_ID);
    }

    //              #     ##                      ##         #      #                                         #
    //              #    #  #                    #  #        #                                                #
    //  ###   ##   ###   #      ###  # #    ##   #  #   ##   ###   ##     ##   # #    ##   # #    ##   ###   ###    ###
    // #  #  # ##   #    # ##  #  #  ####  # ##  ####  #     #  #   #    # ##  # #   # ##  ####  # ##  #  #   #    ##
    //  ##   ##     #    #  #  # ##  #  #  ##    #  #  #     #  #   #    ##    # #   ##    #  #  ##    #  #   #      ##
    // #      ##     ##   ###   # #  #  #   ##   #  #   ##   #  #  ###    ##    #     ##   #  #   ##   #  #    ##  ###
    //  ###
    /**
     * Gets the achievements for a game.
     * @param {number} appId The Steam app ID.
     * @returns {Promise<[SteamAPI.Achievement[], SteamAPI.PlayerAchievements, SteamAPI.GameDetails]>}A promise that returns the game's achievements.
     */
    static getGameAchievements(appId) {
        const steam = new SteamApi(process.env.STEAM_API_KEY);

        return Promise.all([
            (async () => {
                try {
                    /** @type {{[x: string]: any}} */
                    const schema = await steam.getGameSchema(appId.toString());

                    if (schema && schema.availableGameStats && schema.availableGameStats.achievements && schema.availableGameStats.achievements.length > 0) {
                        return schema.availableGameStats.achievements;
                    }
                } catch (err) {
                    return void 0;
                }

                return void 0;
            })(),
            (async () => {
                try {
                    return await steam.getUserAchievements(process.env.STEAM_ID, appId.toString());
                } catch (err) {
                    return void 0;
                }
            })(),
            (async () => {
                try {
                    return await steam.getGameDetails(appId.toString());
                } catch (err) {
                    return void 0;
                }
            })()
        ]);
    }
}

module.exports = Steam;
