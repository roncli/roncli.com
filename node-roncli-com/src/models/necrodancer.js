/**
 * @typedef {import("../../types/node/necrodancerTypes").RunData} NecroDancerTypes.RunData
 */

const Cache = require("@roncli/node-redis").Cache,
    Log = require("@roncli/node-application-insights-logger"),
    SortedSetCache = require("@roncli/node-redis").SortedSetCache,
    Toofz = require("../toofz");

//  #   #                              ####
//  #   #                               #  #
//  ##  #   ###    ###   # ##    ###    #  #   ###   # ##    ###    ###   # ##
//  # # #  #   #  #   #  ##  #  #   #   #  #      #  ##  #  #   #  #   #  ##  #
//  #  ##  #####  #      #      #   #   #  #   ####  #   #  #      #####  #
//  #   #  #      #   #  #      #   #   #  #  #   #  #   #  #   #  #      #
//  #   #   ###    ###   #       ###   ####    ####  #   #   ###    ###   #
/**
 * A class that represents a Crypt of the NecroDancer run.
 */
class NecroDancer {
    //                   #           ###                 #
    //                   #            #                 # #
    //  ##    ###   ##   ###    ##    #     ##    ##    #    ####
    // #     #  #  #     #  #  # ##   #    #  #  #  #  ###     #
    // #     # ##  #     #  #  ##     #    #  #  #  #   #     #
    //  ##    # #   ##   #  #   ##    #     ##    ##    #    ####
    /**
     * Caches the Crypt of the NecroDancer runs.
     * @returns {Promise} A promise that resolves when the runs have been cached.
     */
    static async cacheToofz() {
        // Get the runs from Toofz.
        const runs = (await Toofz.getPlayer()).entries.map((run) => ({
            score: run.rank,
            value: {
                name: run.leaderboard.display_name,
                rank: run.rank,
                score: run.score,
                run: run.leaderboard.run,
                end: run.end,
                url: `https://crypt.toofz.com/leaderboards/${run.leaderboard.product}/${run.leaderboard.character}/${run.leaderboard.run}/${run.leaderboard.mode}?id=76561197996696153`
            }
        }));

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await SortedSetCache.add(`${process.env.REDIS_PREFIX}:toofz:runs`, runs, expire);
    }

    //       ##                       ##               #
    //        #                      #  #              #
    //  ##    #     ##    ###  ###   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #      ##    # #   ##   #  #   ##
    /**
     * Clears the Toofz cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearCache() {
        const blogKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:toofz:*`);
        if (blogKeys.length > 0) {
            await Cache.remove(blogKeys);
        }
    }

    //              #    ###
    //              #    #  #
    //  ###   ##   ###   #  #  #  #  ###    ###
    // #  #  # ##   #    ###   #  #  #  #  ##
    //  ##   ##     #    # #   #  #  #  #    ##
    // #      ##     ##  #  #   ###  #  #  ###
    //  ###
    /**
     * Gets a list of NecroDancer runs.
     * @param {number} offset The run to start from.
     * @param {number} count The number of run to retrieve.
     * @returns {Promise<NecroDancer[]>} A promise that returns the NecroDancer runs.
     */
    static async getRuns(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:toofz:runs`])) {
                await NecroDancer.cacheToofz();
            }

            return (await SortedSetCache.get(`${process.env.REDIS_PREFIX}:toofz:runs`, offset, offset + count - 1)).map((s) => new NecroDancer(s));
        } catch (err) {
            Log.error("There was an error while getting NecroDancer runs.", {err});
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
     * Creates a new NecroDancer object.
     * @param {NecroDancerTypes.RunData} data The run data.
     */
    constructor(data) {
        this.name = data.name;
        this.rank = data.rank;
        this.score = data.score;
        this.run = data.run;
        this.end = data.end;
        this.url = data.url;
    }
}

module.exports = NecroDancer;
