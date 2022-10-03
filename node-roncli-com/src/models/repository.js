/**
 * @typedef {import("../../types/node/githubTypes").Commit} GithubTypes.Commit
 * @typedef {import("../../types/node/githubTypes").Release} GithubTypes.Release
 */

const Cache = require("@roncli/node-redis").Cache,
    Github = require("../github"),
    Log = require("@roncli/node-application-insights-logger"),
    SortedSetCache = require("@roncli/node-redis").SortedSetCache;

//  ####                                 #     #
//  #   #                                      #
//  #   #   ###   # ##    ###    ###    ##    ####    ###   # ##   #   #
//  ####   #   #  ##  #  #   #  #        #     #     #   #  ##  #  #   #
//  # #    #####  ##  #  #   #   ###     #     #     #   #  #      #  ##
//  #  #   #      # ##   #   #      #    #     #  #  #   #  #       ## #
//  #   #   ###   #       ###   ####    ###     ##    ###   #          #
//                #                                                #   #
//                #                                                 ###
/**
 * A class that represents a GitHub repository.
 */
class Repository {
    //                   #           ####                     #
    //                   #           #                        #
    //  ##    ###   ##   ###    ##   ###   # #    ##   ###   ###    ###
    // #     #  #  #     #  #  # ##  #     # #   # ##  #  #   #    ##
    // #     # ##  #     #  #  ##    #     # #   ##    #  #   #      ##
    //  ##    # #   ##   #  #   ##   ####   #     ##   #  #    ##  ###
    /**
     * Caches the events.
     * @returns {Promise} A promise that resolves when the events are cached.
     */
    static async cacheEvents() {
        // Retrieve all events from GitHub.
        const events = await Github.getEvents();

        // Separate events into commits and releases.

        /** @type {{score: number, value: GithubTypes.Commit}[]} */
        const commits = [];

        /** @type {{score: number, value: GithubTypes.Release}[]} */
        const releases = [];

        for (const event of events) {
            switch (event.type) {
                case "PushEvent":
                    if (event.payload.commits && event.payload.commits.length > 0) {
                        for (const commit of event.payload.commits.filter((c) => c.distinct)) {
                            commits.push({
                                score: new Date(event.created_at).getTime(),
                                value: {
                                    id: event.id,
                                    repo: event.repo,
                                    actor: event.actor,
                                    org: event.org,
                                    pushId: commit.push_id,
                                    sha: commit.sha,
                                    message: commit.message,
                                    author: commit.author,
                                    url: commit.url.replace(/api\.github\.com\/repos/, "github.com").replace(/\/commits\//, "/commit/"),
                                    distinct: commit.distinct,
                                    createdAt: new Date(event.created_at)
                                }
                            });
                        }
                    }
                    break;
                case "ReleaseEvent":
                    if (!event.payload.release.draft) {
                        if (!releases.find((r) => r.value.releaseId === event.payload.release.id)) {
                            releases.push({
                                score: new Date(event.created_at).getTime(),
                                value: {
                                    id: event.id,
                                    repo: event.repo,
                                    actor: event.actor,
                                    org: event.org,
                                    action: event.payload.action,
                                    url: event.payload.release.html_url,
                                    releaseId: event.payload.release.id,
                                    name: event.payload.release.name,
                                    tagName: event.payload.release.tag_name,
                                    body: event.payload.release.body,
                                    draft: event.payload.release.draft,
                                    createdAt: new Date(event.created_at)
                                }
                            });
                        }
                    }
                    break;
            }
        }

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        Promise.all([
            (async () => {
                if (commits.length > 0) {
                    await SortedSetCache.add(`${process.env.REDIS_PREFIX}:github:commits`, commits, expire);
                }
            })(),
            (async () => {
                if (releases.length > 0) {
                    await SortedSetCache.add(`${process.env.REDIS_PREFIX}:github:releases`, releases, expire);
                }
            })()
        ]);
    }

    //       ##                       ##               #
    //        #                      #  #              #
    //  ##    #     ##    ###  ###   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #      ##    # #   ##   #  #   ##
    /**
     * Clears the repository cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearCache() {
        await Cache.remove([`${process.env.REDIS_PREFIX}:github:commits`, `${process.env.REDIS_PREFIX}:github:releases`]);
    }

    //              #     ##                      #     #
    //              #    #  #                           #
    //  ###   ##   ###   #      ##   # #   # #   ##    ###    ###
    // #  #  # ##   #    #     #  #  ####  ####   #     #    ##
    //  ##   ##     #    #  #  #  #  #  #  #  #   #     #      ##
    // #      ##     ##   ##    ##   #  #  #  #  ###     ##  ###
    //  ###
    /**
     * Gets a list of commits.
     * @param {number} offset The commit to start from.
     * @param {number} count The number of commits to retrieve.
     * @returns {Promise<GithubTypes.Commit[]>} A promise that returns the commits.
     */
    static async getCommits(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:github:commits`])) {
                await Repository.cacheEvents();
            }

            return await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:github:commits`, offset, offset + count - 1);
        } catch (err) {
            Log.error("There was an error while getting commits.", {err});
            return void 0;
        }
    }

    //              #    ###         ##
    //              #    #  #         #
    //  ###   ##   ###   #  #   ##    #     ##    ###   ###    ##    ###
    // #  #  # ##   #    ###   # ##   #    # ##  #  #  ##     # ##  ##
    //  ##   ##     #    # #   ##     #    ##    # ##    ##   ##      ##
    // #      ##     ##  #  #   ##   ###    ##    # #  ###     ##   ###
    //  ###
    /**
     * Gets a list of releases.
     * @param {number} offset The release to start from.
     * @param {number} count The number of releases to retrieve.
     * @returns {Promise<GithubTypes.Release[]>} A promise that returns the releases.
     */
    static async getReleases(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:github:releases`])) {
                await Repository.cacheEvents();
            }

            return await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:github:releases`, offset, offset + count - 1);
        } catch (err) {
            Log.error("There was an error while getting releases.", {err});
            return void 0;
        }
    }
}

module.exports = Repository;
