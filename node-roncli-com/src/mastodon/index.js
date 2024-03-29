/**
 * @typedef {import("../../types/node/mastodonTypes").Post} MastodonTypes.Post
 */

const Megalodon = require("megalodon"),
    client = Megalodon.default("mastodon", process.env.MASTODON_SERVER);

//  #   #                 #                #
//  #   #                 #                #
//  ## ##   ###    ###   ####    ###    ## #   ###   # ##
//  # # #      #  #       #     #   #  #  ##  #   #  ##  #
//  #   #   ####   ###    #     #   #  #   #  #   #  #   #
//  #   #  #   #      #   #  #  #   #  #  ##  #   #  #   #
//  #   #   ####  ####     ##    ###    ## #   ###   #   #
/**
 * A class that handles calls to the Mastodon API.
 */
class Mastodon {
    //              #    #  #              ###                 #
    //              #    ## #              #  #                #
    //  ###   ##   ###   ## #   ##   #  #  #  #   ##    ###   ###    ###
    // #  #  # ##   #    # ##  # ##  #  #  ###   #  #  ##      #    ##
    //  ##   ##     #    # ##  ##    ####  #     #  #    ##    #      ##
    // #      ##     ##  #  #   ##   ####  #      ##   ###      ##  ###
    //  ###
    /**
     * Gets the newest Mastodon posts based on the last received ID.
     * @param {string} lastId The last post ID.
     * @returns {Promise<MastodonTypes.Post[]>} A list of Mastodon posts.
     */
    static async getNewPosts(lastId) {
        /** @type {MastodonTypes.Post[]} */
        const posts = [];

        /** @type {Megalodon.Entity.Status[]} */
        let statuses = [];

        /** @type {string} */
        let maxId = void 0;

        do {
            const timeline = await client.getAccountStatuses(process.env.MASTODON_ID, {limit: 40, "since_id": lastId, "exclude_replies": true, "max_id": maxId});

            if (timeline.status !== 200) {
                throw new Error(`Server returned ${timeline.status} while retrieving new Mastodon posts.`);
            }

            statuses = timeline.data;

            if (statuses.length > 0) {
                for (const post of statuses) {
                    if (post.reblog) {
                        posts.push({
                            id: post.id,
                            post: post.reblog,
                            createdAt: new Date(post.created_at)
                        });
                    } else {
                        posts.push({
                            id: post.id,
                            post,
                            createdAt: new Date(post.created_at)
                        });
                    }
                }

                maxId = statuses[statuses.length - 1].id;
            }
        } while (statuses.length === 40);

        return posts;
    }

    //              #    ###    #                ##     #
    //              #     #                       #
    //  ###   ##   ###    #    ##    # #    ##    #    ##    ###    ##
    // #  #  # ##   #     #     #    ####  # ##   #     #    #  #  # ##
    //  ##   ##     #     #     #    #  #  ##     #     #    #  #  ##
    // #      ##     ##   #    ###   #  #   ##   ###   ###   #  #   ##
    //  ###
    /**
     * Gets the Mastodon timeline.
     * @returns {Promise<MastodonTypes.Post[]>} A list of Mastodon posts.
     */
    static async getTimeline() {
        /** @type {MastodonTypes.Post[]} */
        const posts = [];

        const timeline = await client.getAccountStatuses(process.env.MASTODON_ID, {limit: 40, "exclude_replies": true});

        if (timeline.status !== 200) {
            throw new Error(`Server returned ${timeline.status} while retrieving the Mastodon timeline.`);
        }

        for (const post of timeline.data) {
            if (post.reblog) {
                posts.push({
                    id: post.id,
                    post: post.reblog,
                    createdAt: new Date(post.created_at)
                });
            } else {
                posts.push({
                    id: post.id,
                    post,
                    createdAt: new Date(post.created_at)
                });
            }
        }

        return posts;
    }
}

module.exports = Mastodon;
