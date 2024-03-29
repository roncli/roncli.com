/**
 * @typedef {import("../../types/node/trackTypes").Track} TrackTypes.Track
 * @typedef {import("../../types/node/trackTypes").TrackInfo} TrackTypes.TrackInfo
 */

const Cache = require("@roncli/node-redis").Cache,
    Log = require("@roncli/node-application-insights-logger"),
    SortedSetCache = require("@roncli/node-redis").SortedSetCache,
    SoundCloud = require("../soundcloud"),

    tagRegex = /[^\s"]+|"[^"]*"/g;

//  #####                       #
//    #                         #
//    #    # ##    ###    ###   #   #
//    #    ##  #      #  #   #  #  #
//    #    #       ####  #      ###
//    #    #      #   #  #   #  #  #
//    #    #       ####   ###   #   #
/**
 * A class that represents a SoundCloud track.
 */
class Track {
    //                   #            ##                        #        ##                   #
    //                   #           #  #                       #         #                   #
    //  ##    ###   ##   ###    ##    #     ##   #  #  ###    ###   ##    #     ##   #  #   ###
    // #     #  #  #     #  #  # ##    #   #  #  #  #  #  #  #  #  #      #    #  #  #  #  #  #
    // #     # ##  #     #  #  ##    #  #  #  #  #  #  #  #  #  #  #      #    #  #  #  #  #  #
    //  ##    # #   ##   #  #   ##    ##    ##    ###  #  #   ###   ##   ###    ##    ###   ###
    /**
     * Caches the tracks from SoundCloud.
     * @returns {Promise} A promise that resolves when the tracks are cached.
     */
    static async cacheSoundCloud() {
        // Retrieve all the tracks from SoundCloud.
        /** @type {{score: number, value:{track: TrackTypes.TrackInfo, publishDate: Date, tagList: string[]}}[]} */
        const tracks = (await SoundCloud.getTracks()).map((track) => {
            const publishDate = track.release_year ? new Date(track.release_year, track.release_month ? track.release_month - 1 : 0, track.release_day || 1) : new Date(track.created_at);
            return {
                score: publishDate.getTime(),
                value: {
                    track: {
                        id: track.id,
                        user: {username: track.user.username},
                        title: track.title,
                        uri: track.uri,
                        "permalink_url": track.permalink_url,
                        description: track.description
                    },
                    publishDate,
                    tagList: Track.extractTags(track)
                }
            };
        });

        // Divide the tracks into tags.
        /** @type {{[x: string]: {score: number, value: {track: TrackTypes.TrackInfo, publishDate: Date}}[]}} */
        const tags = {};
        for (const track of tracks) {
            if (track.value.tagList && track.value.tagList.length > 0) {
                for (const tag of track.value.tagList) {
                    if (!tags[tag]) {
                        tags[tag] = [];
                    }
                    tags[tag].push(track);
                }
            }
        }

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 30);

        /** @type {Promise[]} */
        const promises = [
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:soundcloud:tracks`, tracks, expire),
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:soundcloud:tags`, Object.keys(tags).map((tag) => ({
                score: tags[tag].length,
                value: tag
            })))
        ];

        promises.push(...tracks.map((track) => Cache.add(`${process.env.REDIS_PREFIX}:soundcloud:track:${track.value.track.id}`, track.value, expire)));

        promises.push(...Object.keys(tags).map((tag) => SortedSetCache.add(`${process.env.REDIS_PREFIX}:soundcloud:tag:${tag}`, tags[tag], expire)));

        await Promise.all(promises);
    }

    //       ##                       ##               #
    //        #                      #  #              #
    //  ##    #     ##    ###  ###   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #      ##    # #   ##   #  #   ##
    /**
     * Clears the blog cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearCache() {
        const keys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:soundcloud:*`);
        if (keys.length > 0) {
            await Cache.remove(keys);
        }
    }

    //                          #    ###                     #
    //                          #     #                      #
    //  ##    ##   #  #  ###   ###    #    ###    ###   ##   # #    ###
    // #     #  #  #  #  #  #   #     #    #  #  #  #  #     ##    ##
    // #     #  #  #  #  #  #   #     #    #     # ##  #     # #     ##
    //  ##    ##    ###  #  #    ##   #    #      # #   ##   #  #  ###
    /**
     * Gets the number of SoundCloud tracks.
     * @returns {Promise<number>} A promise that returns the number of tracks.
     */
    static async countTracks() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tracks`])) {
                await Track.cacheSoundCloud();
            }

            return await SortedSetCache.count(`${process.env.REDIS_PREFIX}:soundcloud:tracks`, "-inf", "+inf");
        } catch (err) {
            Log.error("There was an error while counting SoundCloud tracks.", {err});
            return 0;
        }
    }

    //                          #    ###                     #            ###          ##          #
    //                          #     #                      #            #  #        #  #         #
    //  ##    ##   #  #  ###   ###    #    ###    ###   ##   # #    ###   ###   #  #  #      ###  ###    ##    ###   ##   ###   #  #
    // #     #  #  #  #  #  #   #     #    #  #  #  #  #     ##    ##     #  #  #  #  #     #  #   #    # ##  #  #  #  #  #  #  #  #
    // #     #  #  #  #  #  #   #     #    #     # ##  #     # #     ##   #  #   # #  #  #  # ##   #    ##     ##   #  #  #      # #
    //  ##    ##    ###  #  #    ##   #    #      # #   ##   #  #  ###    ###     #    ##    # #    ##   ##   #      ##   #       #
    //                                                                           #                             ###               #
    /**
     * Gets the number of SoundCloud tracks for the specified category.
     * @param {string} category The category.
     * @returns {Promise<number>} A promise that returns the number of tracks.
     */
    static async countTracksByCategory(category) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tag:${category}`])) {
                await Track.cacheSoundCloud();
            }

            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tracks`])) {
                return 0;
            }

            return await SortedSetCache.count(`${process.env.REDIS_PREFIX}:soundcloud:tag:${category}`, "-inf", "+inf");
        } catch (err) {
            Log.error("There was an error while counting SoundCloud tracks by category.", {err});
            return 0;
        }
    }

    //              #                       #    ###
    //              #                       #     #
    //  ##   #  #  ###   ###    ###   ##   ###    #     ###   ###   ###
    // # ##   ##    #    #  #  #  #  #      #     #    #  #  #  #  ##
    // ##     ##    #    #     # ##  #      #     #    # ##   ##     ##
    //  ##   #  #    ##  #      # #   ##     ##   #     # #  #     ###
    //                                                        ###
    /**
     * Extracts the tags from a SoundCloud track.
     * @param {TrackTypes.Track} track The track.
     * @returns {string[]} The tags.
     */
    static extractTags(track) {
        const tags = [];

        if (track.genre) {
            tags.push(track.genre);
        }

        if (track.tag_list && track.tag_list.length > 0) {
            const tagList = track.tag_list.trim().match(tagRegex);

            for (const rawTag of tagList) {
                tags.push(rawTag.replace(/"/g, ""));
            }
        }

        return tags;
    }

    //              #     ##          #                             #
    //              #    #  #         #
    //  ###   ##   ###   #      ###  ###    ##    ###   ##   ###   ##     ##    ###
    // #  #  # ##   #    #     #  #   #    # ##  #  #  #  #  #  #   #    # ##  ##
    //  ##   ##     #    #  #  # ##   #    ##     ##   #  #  #      #    ##      ##
    // #      ##     ##   ##    # #    ##   ##   #      ##   #     ###    ##   ###
    //  ###                                       ###
    /**
     * Gets the track categories.
     * @returns {Promise<{category: string, tracks: number}[]>} A promise that returns the categories.
     */
    static async getCategories() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tags`])) {
                await Track.cacheSoundCloud();
            }

            const categories = await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:soundcloud:tags`, 0, -1, true);

            return categories.map((c) => ({category: c.value, tracks: c.score}));
        } catch (err) {
            Log.error("There was an error while getting track categories.", {err});
            return void 0;
        }
    }

    //              #    ###                     #     ###         ###      #
    //              #     #                      #     #  #         #       #
    //  ###   ##   ###    #    ###    ###   ##   # #   ###   #  #   #     ###
    // #  #  # ##   #     #    #  #  #  #  #     ##    #  #  #  #   #    #  #
    //  ##   ##     #     #    #     # ##  #     # #   #  #   # #   #    #  #
    // #      ##     ##   #    #      # #   ##   #  #  ###     #   ###    ###
    //  ###                                                   #
    /**
     * Gets a track by its ID.
     * @param {string} id The ID.
     * @returns {Promise<Track>} A promise that returns the track.
     */
    static async getTrackById(id) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tracks`])) {
                await Track.cacheSoundCloud();
            }

            /** @type {{track: TrackTypes.TrackInfo, publishDate: Date, tagList: string[]}} */
            const track = await Cache.get(`${process.env.REDIS_PREFIX}:soundcloud:track:${id}`);

            if (!track) {
                return void 0;
            }

            const [mainNav, categoryNavs] = await Promise.all([
                (async () => {
                    const rank = await SortedSetCache.rankReverse(`${process.env.REDIS_PREFIX}:soundcloud:tracks`, track);

                    const [prev, next] = await Promise.all([
                        (async () => {
                            const prevTitle = await Track.getTracks(rank + 1, 1);

                            if (!prevTitle) {
                                return void 0;
                            }

                            return prevTitle[0];
                        })(),
                        (async () => {
                            if (rank === 0) {
                                return void 0;
                            }

                            return (await Track.getTracks(rank - 1, 1))[0];
                        })()
                    ]);

                    return {prev, next};
                })(),
                (async () => {
                    /** @type {{[x: string]: {prev: Track, next: Track}}} */
                    const categories = {};

                    await Promise.all(track.tagList.map((category) => (async () => {
                        const rank = await SortedSetCache.rankReverse(`${process.env.REDIS_PREFIX}:soundcloud:tag:${category}`, track);

                        const [prev, next] = await Promise.all([
                            (async () => {
                                const prevTitle = await Track.getTracksByCategory(category, rank + 1, 1);

                                if (!prevTitle) {
                                    return void 0;
                                }

                                return prevTitle[0];
                            })(),
                            (async () => {
                                if (rank === 0) {
                                    return void 0;
                                }

                                return (await Track.getTracksByCategory(category, rank - 1, 1))[0];
                            })()
                        ]);

                        if (prev || next) {
                            categories[category] = {prev, next};
                        }
                    })()));

                    return categories;
                })()
            ]);

            return new Track(track, mainNav, categoryNavs);
        } catch (err) {
            Log.error("There was an error while getting a track.", {err});
            return void 0;
        }
    }

    //              #    ###                     #
    //              #     #                      #
    //  ###   ##   ###    #    ###    ###   ##   # #    ###
    // #  #  # ##   #     #    #  #  #  #  #     ##    ##
    //  ##   ##     #     #    #     # ##  #     # #     ##
    // #      ##     ##   #    #      # #   ##   #  #  ###
    //  ###
    /**
     * Gets a list of tracks.
     * @param {number} offset The track to start from.
     * @param {number} count The number of tracks to retrieve.
     * @returns {Promise<Track[]>} A promise that returns the tracks.
     */
    static async getTracks(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tracks`])) {
                await Track.cacheSoundCloud();
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:soundcloud:tracks`, offset, offset + count - 1)).map((t) => new Track(t));
        } catch (err) {
            Log.error("There was an error while getting tracks.", {err});
            return [];
        }
    }

    //              #    ###                     #            ###          ##          #
    //              #     #                      #            #  #        #  #         #
    //  ###   ##   ###    #    ###    ###   ##   # #    ###   ###   #  #  #      ###  ###    ##    ###   ##   ###   #  #
    // #  #  # ##   #     #    #  #  #  #  #     ##    ##     #  #  #  #  #     #  #   #    # ##  #  #  #  #  #  #  #  #
    //  ##   ##     #     #    #     # ##  #     # #     ##   #  #   # #  #  #  # ##   #    ##     ##   #  #  #      # #
    // #      ##     ##   #    #      # #   ##   #  #  ###    ###     #    ##    # #    ##   ##   #      ##   #       #
    //  ###                                                          #                             ###               #
    /**
     * Gets a list of tracks by category.
     * @param {string} category The category to get tracks for.
     * @param {number} offset The track to start from.
     * @param {number} count The number of tracks to retrieve.
     * @returns {Promise<Track[]>} A promise that returns the tracks.
     */
    static async getTracksByCategory(category, offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tracks`])) {
                await Track.cacheSoundCloud();
            }

            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tag:${category}`])) {
                return void 0;
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:soundcloud:tag:${category}`, offset, offset + count - 1)).map((t) => new Track(t));
        } catch (err) {
            Log.error("There was an error while getting tracks by category.", {err});
            return void 0;
        }
    }

    //              #    ###                     #            ###          ##          #                                  ###         ###          #
    //              #     #                      #            #  #        #  #         #                                  #  #        #  #         #
    //  ###   ##   ###    #    ###    ###   ##   # #    ###   ###   #  #  #      ###  ###    ##    ###   ##   ###   #  #  ###   #  #  #  #   ###  ###    ##
    // #  #  # ##   #     #    #  #  #  #  #     ##    ##     #  #  #  #  #     #  #   #    # ##  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #   #    # ##
    //  ##   ##     #     #    #     # ##  #     # #     ##   #  #   # #  #  #  # ##   #    ##     ##   #  #  #      # #  #  #   # #  #  #  # ##   #    ##
    // #      ##     ##   #    #      # #   ##   #  #  ###    ###     #    ##    # #    ##   ##   #      ##   #       #   ###     #   ###    # #    ##   ##
    //  ###                                                          #                             ###               #           #
    /**
     * Gets the tracks by category and date.
     * @param {string} category The category to get tracks by.
     * @param {Date} date The date to get tracks by.
     * @returns {Promise<{page: number, tracks: Track[]}>} A promise that returns the list of tracks.
     */
    static async getTracksByCategoryByDate(category, date) {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tracks`])) {
            await Track.cacheSoundCloud();
        }

        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tag:${category}`])) {
            return void 0;
        }

        const count = await SortedSetCache.count(`${process.env.REDIS_PREFIX}:soundcloud:tag:${category}`, `(${date.getTime()}`, "+inf"),
            page = Math.max(Math.ceil(count / Track.pageSize), 1);

        return {
            page,
            tracks: await Track.getTracksByCategory(category, page * Track.pageSize - Track.pageSize, Track.pageSize)
        };
    }

    //              #    ###                     #            ###         ###          #
    //              #     #                      #            #  #        #  #         #
    //  ###   ##   ###    #    ###    ###   ##   # #    ###   ###   #  #  #  #   ###  ###    ##
    // #  #  # ##   #     #    #  #  #  #  #     ##    ##     #  #  #  #  #  #  #  #   #    # ##
    //  ##   ##     #     #    #     # ##  #     # #     ##   #  #   # #  #  #  # ##   #    ##
    // #      ##     ##   #    #      # #   ##   #  #  ###    ###     #   ###    # #    ##   ##
    //  ###                                                          #
    /**
     * Gets the tracks by date.
     * @param {Date} date The date to get tracks by.
     * @returns {Promise<{page: number, tracks: Track[]}>} A promise that returns the list of tracks.
     */
    static async getTracksByDate(date) {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tracks`])) {
            await Track.cacheSoundCloud();
        }

        const count = await SortedSetCache.count(`${process.env.REDIS_PREFIX}:soundcloud:tracks`, `(${date.getTime()}`, "+inf"),
            page = Math.max(Math.ceil(count / Track.pageSize), 1);

        return {
            page,
            tracks: await Track.getTracks(page * Track.pageSize - Track.pageSize, Track.pageSize)
        };
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new track object.
     * @param {{track: TrackTypes.TrackInfo, publishDate: Date, tagList: string[]}} data The track data.
     * @param {{prev: Track, next: Track}} [mainNav] The main navs.
     * @param {{[x: string]: {prev: Track, next: Track}}} [categoryNavs] The category navs.
     */
    constructor(data, mainNav, categoryNavs) {
        this.id = data.track.id;
        this.username = data.track.user.username;
        this.title = data.track.title;
        this.uri = data.track.uri;
        this.permalink = data.track.permalink_url;
        this.description = data.track.description;
        this.publishDate = data.publishDate;
        this.tagList = data.tagList;
        this.mainNav = mainNav;
        this.categoryNavs = categoryNavs;

        this.url = `/soundcloud/${this.id}/${this.permalink.split("/")[4]}`;
    }
}

Track.pageSize = 10;

module.exports = Track;
