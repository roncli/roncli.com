const Blog = require("./models/blog"),
    Cache = require("@roncli/node-redis").Cache,
    Log = require("@roncli/node-application-insights-logger"),
    NecroDancer = require("./models/necrodancer"),
    Profile = require("./models/profile"),
    Repository = require("./models/repository"),
    Speedrun = require("./models/speedrun"),
    SteamGame = require("./models/steamGame"),
    Track = require("./models/track");

//   ###                 #             ####           #
//  #   #                #              #  #          #
//  #       ###    ###   # ##    ###    #  #   ###   ####    ###
//  #          #  #   #  ##  #  #   #   #  #      #   #         #
//  #       ####  #      #   #  #####   #  #   ####   #      ####
//  #   #  #   #  #   #  #   #  #       #  #  #   #   #  #  #   #
//   ###    ####   ###   #   #   ###   ####    ####    ##    ####
/**
 * A class that attempts to keep cached data available.
 */
class CacheData {
    //       #                 #      ##               #
    //       #                 #     #  #              #
    //  ##   ###    ##    ##   # #   #      ###   ##   ###    ##
    // #     #  #  # ##  #     ##    #     #  #  #     #  #  # ##
    // #     #  #  ##    #     # #   #  #  # ##  #     #  #  ##
    //  ##   #  #   ##    ##   #  #   ##    # #   ##   #  #   ##
    /**
     * Checks the cache and makes sure key data is available.
     * @returns {Promise} A promise that resolves when the cache has been checked.
     */
    static async checkCache() {
        await Promise.all([
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:blog:titles`) < 1800) {
                        console.log(`Blog: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:blog:titles`)}`);
                        await Blog.cacheBlog();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the Blog cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:toofz:runs`) < 1800) {
                        console.log(`Toofz: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:toofz:runs`)}`);
                        await NecroDancer.cacheToofz();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the Toofz cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:d3:profile`) < 1800) {
                        console.log(`D3: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:d3:profile`)}`);
                        await Profile.cacheD3();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the Diablo III cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:wow:profile`) < 1800) {
                        console.log(`WoW: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:wow:profile`)}`);
                        await Profile.cacheWoW();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the WoW cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:ff14:profile`) < 1800) {
                        console.log(`FF14: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:ff14:profile`)}`);
                        await Profile.cacheFF14();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the Final Fantasy XIV cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:github:commits`) < 1800 || await Cache.ttl(`${process.env.REDIS_PREFIX}:github:releases`) < 1800) {
                        console.log(`GitHub Commits: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:github:commits`)}`);
                        console.log(`GitHub Releases: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:github:releases`)}`);
                        await Repository.cacheEvents();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the GitHub cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:speedrun.com:speedruns`) < 1800) {
                        console.log(`Speedruns: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:speedrun.com:speedruns`)}`);
                        await Speedrun.cacheSpeedruns();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the Speedrun.com cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:soundcloud:tracks`) < 1800) {
                        console.log(`SoundCloud: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:soundcloud:tracks`)}`);
                        await Track.cacheSoundCloud();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the SoundCloud cache.", {err});
                }
            })(),
            (async () => {
                try {
                    if (await Cache.ttl(`${process.env.REDIS_PREFIX}:steam:games`) < 1800) {
                        console.log(`Steam: ${await Cache.ttl(`${process.env.REDIS_PREFIX}:steam:games`)}`);
                        await SteamGame.cacheGames();
                    }
                } catch (err) {
                    Log.error("There was a problem checking the Steam cache.", {err});
                }
            })()
        ]);

        setTimeout(CacheData.checkCache, 1800000);
    }
}

module.exports = CacheData;
