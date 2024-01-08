/**
 * @typedef {import("../../types/node/necrodancerTypes").RunData} NecroDancerTypes.RunData
 * @typedef {import("../../types/node/necrodancerTypes").TagType} NecroDancerTypes.TagType
 * @typedef {{slug: string, rank: number, score: number, metadata: {name: string, value: string, display_name: string}[], meme: boolean}} Run
 */

const Cache = require("@roncli/node-redis").Cache,
    request = require("@root/request");

//  #   #                               ##           #
//  #   #                                #           #
//  ##  #   ###    ###   # ##    ###     #     ###   # ##
//  # # #  #   #  #   #  ##  #  #   #    #        #  ##  #
//  #  ##  #####  #      #      #   #    #     ####  #   #
//  #   #  #      #   #  #      #   #    #    #   #  ##  #
//  #   #   ###    ###   #       ###    ###    ####  # ##
/**
 * A class that handles calls to the Necrolab API.
 */
class Necrolab {
    //              #    ###               #
    //              #    #  #              #
    //  ###   ##   ###   #  #   ###  ###   # #
    // #  #  # ##   #    ###   #  #  #  #  ##
    //  ##   ##     #    # #   # ##  #  #  # #
    // #      ##     ##  #  #   # #  #  #  #  #
    //  ###
    /**
     * Gets the player's rank.
     * @param {string} name The name of the player.
     * @returns {Promise<number>} A promise that returns the rank.
     */
    static async getRank(name) {
        const res = await request.get({
            uri: `https://www.necrolab.com/api/rankings/steam/all-time~any-percent~synchrony-amplified~single-player~ost/all/entries?search=${name}`,
            json: true,
            auth: {
                bearer: process.env.NECROLAB_TOKEN
            }
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting a player's rank from Necrolab: status ${res.statusCode}`);
        }

        return res.body.data[0].rank;
    }

    //              #    ###
    //              #    #  #
    //  ###   ##   ###   #  #  #  #  ###    ###
    // #  #  # ##   #    ###   #  #  #  #  ##
    //  ##   ##     #    # #   #  #  #  #    ##
    // #      ##     ##  #  #   ###  #  #  ###
    //  ###
    /**
     * Gets runs for a player by their rank.
     * @param {number} rank The rank.
     * @returns {Promise<NecroDancerTypes.RunData[]>} A promise that returns the runs.
     */
    static async getRuns(rank) {
        const [speedruns, score, deathless, [tagTypes, slugMatch]] = await Promise.all([
            (
                /**
                 * @returns {Promise<Run[]>} A promise that returns the speedruns.
                 */
                async () => {
                    const res = await request.get({
                        uri: `https://www.necrolab.com/api/rankings/steam/all-time~any-percent~synchrony-amplified~single-player~ost/all/entries/${rank}/leaderboards/time?limit=10000`,
                        json: true,
                        auth: {
                            bearer: process.env.NECROLAB_TOKEN
                        }
                    });

                    if (res.statusCode !== 200) {
                        throw new Error(`There was an error while getting a player's speedruns from Necrolab: status ${res.statusCode}`);
                    }

                    return res.body.data.map((run) => ({
                        slug: run.slug,
                        rank: run.rank,
                        score: +run.metric,
                        metadata: run.pb_metadata,
                        meme: run.is_meme
                    }));
                }
            )(),
            (
                /**
                 * @returns {Promise<Run[]>} A promise that returns the score runs.
                 */
                async () => {
                    const res = await request.get({
                        uri: `https://www.necrolab.com/api/rankings/steam/all-time~any-percent~synchrony-amplified~single-player~ost/all/entries/${rank}/leaderboards/score?limit=10000`,
                        json: true,
                        auth: {
                            bearer: process.env.NECROLAB_TOKEN
                        }
                    });

                    if (res.statusCode !== 200) {
                        throw new Error(`There was an error while getting a player's speedruns from Necrolab: status ${res.statusCode}`);
                    }

                    return res.body.data.map((run) => ({
                        slug: run.slug,
                        rank: run.rank,
                        score: +run.metric,
                        metadata: run.pb_metadata,
                        meme: run.is_meme
                    }));
                }
            )(),
            (
                /**
                 * @returns {Promise<Run[]>} A promise that returns the deathless runs.
                 */
                async () => {
                    const res = await request.get({
                        uri: `https://www.necrolab.com/api/rankings/steam/all-time~any-percent~synchrony-amplified~single-player~ost/all/entries/${rank}/leaderboards/wins?limit=10000`,
                        json: true,
                        auth: {
                            bearer: process.env.NECROLAB_TOKEN
                        }
                    });

                    if (res.statusCode !== 200) {
                        throw new Error(`There was an error while getting a player's speedruns from Necrolab: status ${res.statusCode}`);
                    }

                    return res.body.data.map((run) => ({
                        slug: run.slug,
                        rank: run.rank,
                        score: +run.metric,
                        metadata: run.pb_metadata,
                        meme: run.is_meme
                    }));
                }
            )(),
            (async () => {
                await Necrolab.cacheTags();

                return Promise.all([
                    (
                        /**
                         * @returns {Promise<NecroDancerTypes.TagType[]>} A promise that returns the tag types.
                         */
                        () => Cache.get(`${process.env.REDIS_PREFIX}:necrolab:tags`)
                    )(),
                    (async () => new RegExp(await Cache.get(`${process.env.REDIS_PREFIX}:necrolab:tags:regex`)))()
                ]);
            })()
        ]);

        const runs = [...speedruns, ...score, ...deathless].map((run) => ({
            rank: run.rank,
            score: run.score,
            end: {
                zone: (() => {
                    const zone = run.metadata.find((m) => m.name === "end_zone");

                    return zone ? +zone.value : void 0;
                })(),
                level: (() => {
                    const level = run.metadata.find((m) => m.name === "end_level");

                    return level ? +level.value : void 0;
                })()
            },
            url: `https://necrolab.com/leaderboards#platform=steam&tags=${run.slug}&memes=${run.meme}&search=roncli`,
            tags: slugMatch.exec(run.slug).groups
        })).filter((r) => r.tags.type === "all-time" && r.tags.release === "synchrony-amplified" && r.tags.multiplayertype === "single-player" && ["ost", "no-beat", "double-tempo"].indexOf(r.tags.soundtrack) !== -1);

        return runs.map((run) => ({
            rank: run.rank,
            score: run.score,
            end: {
                zone: run.end.zone,
                level: run.end.level
            },
            url: run.url,
            name: `${tagTypes.find((t) => t.slug === "character").tags.find((t) => t.slug === run.tags.character).name} ${run.tags.percent === "low-percent" ? "Low% " : ""}${run.tags.mode === "any" ? "" : `${tagTypes.find((t) => t.slug === "mode").tags.find((t) => t.slug === run.tags.mode).name} `}${run.tags.seededtype === "unseeded" ? "" : `${tagTypes.find((t) => t.slug === "seeded-type").tags.find((t) => t.slug === run.tags.seededtype).name} `}${tagTypes.find((t) => t.slug === "category").tags.find((t) => t.slug === run.tags.category).name} ${tagTypes.find((t) => t.slug === "release").tags.find((t) => t.slug === run.tags.release).name}`,
            run: `${run.tags.seededtype === "unseeded" ? "" : `${tagTypes.find((t) => t.slug === "seeded-type").tags.find((t) => t.slug === run.tags.seededtype).name} `}${tagTypes.find((t) => t.slug === "category").tags.find((t) => t.slug === run.tags.category).name}`
        }));
    }

    //                   #           ###
    //                   #            #
    //  ##    ###   ##   ###    ##    #     ###   ###   ###
    // #     #  #  #     #  #  # ##   #    #  #  #  #  ##
    // #     # ##  #     #  #  ##     #    # ##   ##     ##
    //  ##    # #   ##   #  #   ##    #     # #  #     ###
    //                                            ###
    /**
     * Caches the list of tags from Necrolab.
     * @returns {Promise} A promise that resolves when the tags are cached.
     */
    static async cacheTags() {
        const key = `${process.env.REDIS_PREFIX}:necrolab:tags`;

        if (await Cache.ttl(key) > 1800) {
            return;
        }

        const res = await request.get({
            uri: "https://www.necrolab.com/api/filters",
            json: true,
            auth: {
                bearer: process.env.NECROLAB_TOKEN
            }
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting tags from Necrolab: status ${res.statusCode}`);
        }

        const expire = new Date();
        expire.setDate(expire.getDate() + 30);

        await Promise.all([
            (() => Cache.add(key, res.body.data.platforms[0].tag_types.map((type) => ({
                name: type.name,
                slug: type.slug,
                tags: type.tags.map((tag) => ({
                    name: tag.name,
                    slug: tag.slug
                }))
            })), expire))(),
            (() => Cache.add(`${process.env.REDIS_PREFIX}:necrolab:tags:regex`, res.body.data.platforms[0].tag_types.map((type) => `(?<${type.slug.replace(/-/g, "")}>${type.tags.map((tag) => `${tag.slug}`).join("|")})`).join("-")))()
        ]);

    }
}

module.exports = Necrolab;
