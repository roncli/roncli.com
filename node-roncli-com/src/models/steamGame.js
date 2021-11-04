/**
 * @typedef {{name: string, defaultvalue: number, displayName: string, hidden: number, description: string, icon: string, icongray: string}} SteamAPI.Achievement
 * @typedef {Awaited<ReturnType<import("steamapi")["getUserOwnedGames"]>>[number]} SteamAPI.Game
 * @typedef {Awaited<ReturnType<import("steamapi")["getUserAchievements"]>>} SteamAPI.PlayerAchievements
 */

const Cache = require("@roncli/node-redis").Cache,
    Log = require("@roncli/node-application-insights-logger"),
    HashCache = require("@roncli/node-redis").HashCache,
    SortedSetCache = require("@roncli/node-redis").SortedSetCache,
    Steam = require("../steam");

//   ###    #                           ###
//  #   #   #                          #   #
//  #      ####    ###    ###   ## #   #       ###   ## #    ###
//   ###    #     #   #      #  # # #  #          #  # # #  #   #
//      #   #     #####   ####  # # #  #  ##   ####  # # #  #####
//  #   #   #  #  #      #   #  # # #  #   #  #   #  # # #  #
//   ###     ##    ###    ####  #   #   ###    ####  #   #   ###
/**
 * A class that represents a Steam game.
 */
class SteamGame {
    //                   #            ##         #      #                                         #
    //                   #           #  #        #                                                #
    //  ##    ###   ##   ###    ##   #  #   ##   ###   ##     ##   # #    ##   # #    ##   ###   ###    ###
    // #     #  #  #     #  #  # ##  ####  #     #  #   #    # ##  # #   # ##  ####  # ##  #  #   #    ##
    // #     # ##  #     #  #  ##    #  #  #     #  #   #    ##    # #   ##    #  #  ##    #  #   #      ##
    //  ##    # #   ##   #  #   ##   #  #   ##   #  #  ###    ##    #     ##   #  #   ##   #  #    ##  ###
    /**
     * Caches the achievements for a game from Steam.
     * @param {number} appId The App ID of the game.
     * @returns {Promise} A promise that resolves when the achievements have been cached.
     */
    static async cacheAchievements(appId) {
        // Retrieve achievements from Steam.
        const achievements = await Steam.getGameAchievements(appId);

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await Cache.add(`${process.env.REDIS_PREFIX}:steam:achievements:${appId}`, achievements, expire);
    }

    //                   #            ##
    //                   #           #  #
    //  ##    ###   ##   ###    ##   #      ###  # #    ##    ###
    // #     #  #  #     #  #  # ##  # ##  #  #  ####  # ##  ##
    // #     # ##  #     #  #  ##    #  #  # ##  #  #  ##      ##
    //  ##    # #   ##   #  #   ##    ###   # #  #  #   ##   ###
    /**
     * Caches the owned games from Steam.
     * @returns {Promise} A promise that resolves when the games have been cached.
     */
    static async cacheGames() {
        // Retrieve all games from Steam.
        const games = await Steam.getOwnedGames();

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await Promise.all([
            HashCache.add(`${process.env.REDIS_PREFIX}:steam:games`, games.map((game) => ({
                key: game.appID.toString(),
                value: game
            })), expire),
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:steam:games:total`, games.map((game) => ({
                score: game.playTime,
                value: game
            })), expire),
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:steam:games:recent`, games.filter((g) => g.playTime2 && g.playTime2 > 0).map((game) => ({
                score: game.playTime2,
                value: game
            })), expire),
            ...games.map((game) => Cache.add(`${process.env.REDIS_PREFIX}:steam:game:${game.appID}`, game, expire))
        ]);
    }

    //                          #     ##
    //                          #    #  #
    //  ##    ##   #  #  ###   ###   #      ###  # #    ##    ###
    // #     #  #  #  #  #  #   #    # ##  #  #  ####  # ##  ##
    // #     #  #  #  #  #  #   #    #  #  # ##  #  #  ##      ##
    //  ##    ##    ###  #  #    ##   ###   # #  #  #   ##   ###
    /**
     * Counts the number of Steam games.
     * @returns {Promise<number>} A promise that returns the number of Steam games.
     */
    static async countGames() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:steam:games:total`])) {
                await SteamGame.cacheGames();
            }

            return await SortedSetCache.count(`${process.env.REDIS_PREFIX}:steam:games:total`, "-inf", "+inf");
        } catch (err) {
            Log.error("There was an error while counting Steam games.", {err});
            return 0;
        }
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a game by its app ID.
     * @param {number} appId The app ID.
     */
    static async get(appId) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:steam:game:${appId}`])) {
                await SteamGame.cacheGames();
            }

            /** @type {SteamAPI.Game} */
            const data = await Cache.get(`${process.env.REDIS_PREFIX}:steam:game:${appId}`);

            if (!data) {
                return void 0;
            }

            return new SteamGame(data);
        } catch (err) {
            Log.error("There was an error while getting a Steam game.", {err});
            return void 0;
        }
    }

    //              #     ##
    //              #    #  #
    //  ###   ##   ###   #      ###  # #    ##    ###
    // #  #  # ##   #    # ##  #  #  ####  # ##  ##
    //  ##   ##     #    #  #  # ##  #  #  ##      ##
    // #      ##     ##   ###   # #  #  #   ##   ###
    //  ###
    /**
     * Gets a list of games.
     * @param {number} offset The game to start from.
     * @param {number} count The number of games to retrieve.
     * @returns {Promise<SteamGame[]>} A promise that returns the games.
     */
    static async getGames(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:steam:games:total`])) {
                await SteamGame.cacheGames();
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:steam:games:total`, offset, offset + count - 1)).map((g) => new SteamGame(g));
        } catch (err) {
            Log.error("There was an error while getting Steam games.", {err});
            return void 0;
        }
    }

    //              #    ###                            #     ##
    //              #    #  #                           #    #  #
    //  ###   ##   ###   #  #   ##    ##    ##   ###   ###   #      ###  # #    ##    ###
    // #  #  # ##   #    ###   # ##  #     # ##  #  #   #    # ##  #  #  ####  # ##  ##
    //  ##   ##     #    # #   ##    #     ##    #  #   #    #  #  # ##  #  #  ##      ##
    // #      ##     ##  #  #   ##    ##    ##   #  #    ##   ###   # #  #  #   ##   ###
    //  ###
    /**
     * Gets a list of recently played games.
     * @param {number} offset The game to start from.
     * @param {number} count The number of games to retrieve.
     * @returns {Promise<SteamGame[]>} A promise that returns the games.
     */
    static async getRecentGames(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:steam:games:recent`])) {
                await SteamGame.cacheGames();
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:steam:games:recent`, offset, offset + count - 1)).map((g) => new SteamGame(g));
        } catch (err) {
            Log.error("There was an error while getting Steam games.", {err});
            return void 0;
        }
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new Steam game object.
     * @param {SteamAPI.Game} data The Steam game data.
     */
    constructor(data) {
        this.appId = data.appID;
        this.name = data.name;
        this.playtimeTotal = data.playTime;
        this.playtimeTwoWeeks = data.playTime2;
        this.logoUrl = data.logoURL;
        this.iconUrl = data.iconURL;

        /** @type {SteamAPI.Achievement} */
        this.schema = null;

        /** @type {SteamAPI.PlayerAchievements} */
        this.achievements = null;
    }

    // ##                   #   ##         #      #                                         #
    //  #                   #  #  #        #                                                #
    //  #     ##    ###   ###  #  #   ##   ###   ##     ##   # #    ##   # #    ##   ###   ###    ###
    //  #    #  #  #  #  #  #  ####  #     #  #   #    # ##  # #   # ##  ####  # ##  #  #   #    ##
    //  #    #  #  # ##  #  #  #  #  #     #  #   #    ##    # #   ##    #  #  ##    #  #   #      ##
    // ###    ##    # #   ###  #  #   ##   #  #  ###    ##    #     ##   #  #   ##   #  #    ##  ###
    /**
     * Loads the Steam achievements for the game.
     * @returns {Promise} A promise that resolves when the achievements have been loaded.
     */
    async loadAchievements() {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:steam:achievements:${this.appId}`])) {
            await SteamGame.cacheAchievements(this.appId);
        }

        [this.schema, this.achievements] = await Cache.get(`${process.env.REDIS_PREFIX}:steam:achievements:${this.appId}`);
    }
}

SteamGame.pageSize = 16;

module.exports = SteamGame;
