/**
 * @typedef {import("../../types/node/trackTypes").Track} TrackTypes.Track
 */

const Cache = require("node-redis").Cache,
    Log = require("node-application-insights-logger"),
    SortedSetCache = require("node-redis").SortedSetCache,
    Soundcloud = require("../soundcloud"),

    tagRegex = /[^\s"]+|"[^"]*"/g;

//  #####                       #
//    #                         #
//    #    # ##    ###    ###   #   #
//    #    ##  #      #  #   #  #  #
//    #    #       ####  #      ###
//    #    #      #   #  #   #  #  #
//    #    #       ####   ###   #   #
/**
 * A class that represents a Soundcloud track.
 */
class Track {
    //                   #            ##                        #        ##                   #
    //                   #           #  #                       #         #                   #
    //  ##    ###   ##   ###    ##    #     ##   #  #  ###    ###   ##    #     ##   #  #   ###
    // #     #  #  #     #  #  # ##    #   #  #  #  #  #  #  #  #  #      #    #  #  #  #  #  #
    // #     # ##  #     #  #  ##    #  #  #  #  #  #  #  #  #  #  #      #    #  #  #  #  #  #
    //  ##    # #   ##   #  #   ##    ##    ##    ###  #  #   ###   ##   ###    ##    ###   ###
    /**
     * Caches the tracks from Soundcloud.
     * @returns {Promise} A promise that resolves when the tracks are cached.
     */
    static async cacheSoundcloud() {
        // Retrieve all the tracks from Soundcloud.
        const tracks = await (await Soundcloud.getTracks()).map((track) => {
            const publishDate = track.release_year ? new Date(track.release_year, track.release_month ? track.release_month - 1 : 0, track.release_day || 1) : new Date(track.created_at);
            return {
                score: publishDate.getTime(),
                value: {track, publishDate}
            };
        });

        // Divide the tracks into tags.
        /** @type {{[x: string]: {score: number, value: {track: TrackTypes.Track, publishDate: Date}}[]}} */
        const tags = {};
        for (const track of tracks) {
            if (track.value.track.tag_list && track.value.track.tag_list.length > 0) {
                const tagList = track.value.track.tag_list.trim().match(tagRegex);
                for (const rawTag of tagList) {
                    const tag = rawTag.replace(/"/g, "");

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
            (async () => {
                await SortedSetCache.add(`${process.env.REDIS_PREFIX}:soundcloud:tracks`, tracks, expire);
            })(),
            (async () => {
                await SortedSetCache.add(`${process.env.REDIS_PREFIX}:soundcloud:tags`, Object.keys(tags).map((tag) => ({
                    score: tags[tag].length,
                    value: tag
                })));
            })()
        ];

        promises.push(...tracks.map((track) => (async () => {
            await Cache.add(`${process.env.REDIS_PREFIX}:soundcloud:track:${track.value.track.id}`, track.value, expire);
        })()));

        promises.push(...Object.keys(tags).map((tag) => (async () => {
            await SortedSetCache.add(`${process.env.REDIS_PREFIX}:soundcloud:tag:${tag}`, tags[tag], expire);
        })()));

        await Promise.all(promises);
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
                await Track.cacheSoundcloud();
            }

            const track = await Cache.get(`${process.env.REDIS_PREFIX}:soundcloud:track:${id}`);

            return track ? new Track(track) : void 0;
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
                await Track.cacheSoundcloud();
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:soundcloud:tracks`, offset, offset + count - 1)).map((t) => new Track(t));
        } catch (err) {
            Log.error("There was an error while getting tracks.", {err});
            return [];
        }
    }

    //              #    ###                     #            ###         ###
    //              #     #                      #            #  #         #
    //  ###   ##   ###    #    ###    ###   ##   # #    ###   ###   #  #   #     ###   ###
    // #  #  # ##   #     #    #  #  #  #  #     ##    ##     #  #  #  #   #    #  #  #  #
    //  ##   ##     #     #    #     # ##  #     # #     ##   #  #   # #   #    # ##   ##
    // #      ##     ##   #    #      # #   ##   #  #  ###    ###     #    #     # #  #
    //  ###                                                          #                 ###
    /**
     * Gets a list of tracks by tag.
     * @param {string} tag The tag to get tracks for.
     * @param {number} offset The track to start from.
     * @param {number} count The number of tracks to retrieve.
     * @returns {Promise<Track[]>} A promise that returns the tracks.
     */
    static async getTracksByTag(tag, offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:soundcloud:tag:${tag}`])) {
                await Track.cacheSoundcloud();
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:soundcloud:tag:${tag}`, offset, offset + count - 1)).map((t) => new Track(t));
        } catch (err) {
            Log.error("There was an error while getting tracks by tag.", {err});
            return [];
        }
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new track object.
     * @param {{track: TrackTypes.Track, publishDate: Date}} data The track data.
     */
    constructor(data) {
        this.id = data.track.id;
        this.username = data.track.user.username;
        this.title = data.track.title;
        this.uri = data.track.uri;
        this.permalink = data.track.permalink;
        this.publishDate = data.publishDate;
    }
}

module.exports = Track;
