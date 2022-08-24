/**
 * @typedef {import("../../types/node/necrodancerTypes").RunData} NecroDancerTypes.RunData
 */

const Cache = require("@roncli/node-redis").Cache,
    Log = require("@roncli/node-application-insights-logger"),
    Necrolab = require("../necrolab"),
    SortedSetCache = require("@roncli/node-redis").SortedSetCache;

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
    //                   #           #  #                          ##          #
    //                   #           ## #                           #          #
    //  ##    ###   ##   ###    ##   ## #   ##    ##   ###    ##    #     ###  ###
    // #     #  #  #     #  #  # ##  # ##  # ##  #     #  #  #  #   #    #  #  #  #
    // #     # ##  #     #  #  ##    # ##  ##    #     #     #  #   #    # ##  #  #
    //  ##    # #   ##   #  #   ##   #  #   ##    ##   #      ##   ###    # #  ###
    /**
     * Caches the Crypt of the NecroDancer runs.
     * @returns {Promise} A promise that resolves when the runs have been cached.
     */
    static async cacheNecrolab() {
        // Get the runs from Necrolab.
        const rank = await Necrolab.getRank("roncli"),
            runs = (await Necrolab.getRuns(rank)).map((run) => ({
                score: run.rank,
                value: run
            }));

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await Cache.remove([`${process.env.REDIS_PREFIX}:necrolab:runs`]);
        await SortedSetCache.add(`${process.env.REDIS_PREFIX}:necrolab:runs`, runs, expire);
    }

    //       ##                       ##               #
    //        #                      #  #              #
    //  ##    #     ##    ###  ###   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #      ##    # #   ##   #  #   ##
    /**
     * Clears the Necrolab cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearCache() {
        const blogKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:necrolab:*`);
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
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:necrolab:runs`])) {
                await NecroDancer.cacheNecrolab();
            }

            return (await SortedSetCache.get(`${process.env.REDIS_PREFIX}:necrolab:runs`, offset, offset + count - 1)).map((s) => new NecroDancer(s));
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
