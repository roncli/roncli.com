/**
 * @typedef {import("../../types/modules/tumblr").TumblrClient_Fixed} Tumblr.TumblrClient
 */

const TumblrJs = require("tumblr.js");

/** @type {Tumblr.TumblrClient} */
const tumblr = /** @type {Tumblr.TumblrClient} */(TumblrJs.createClient({ // eslint-disable-line no-extra-parens
    credentials: {
        "consumer_key": process.env.TUMBLR_CONSUMER_KEY,
        "consumer_secret": process.env.TUMBLR_CONSUMER_SECRET
    },
    returnPromises: true
}));

//  #####                #       ##
//    #                  #        #
//    #    #   #  ## #   # ##     #    # ##
//    #    #   #  # # #  ##  #    #    ##  #
//    #    #   #  # # #  #   #    #    #
//    #    #  ##  # # #  ##  #    #    #
//    #     ## #  #   #  # ##    ###   #
/**
 * A class that handles calls to Tumblr's API.
 */
class Tumblr {
    //              #    ###    #     #    ##          ####                    ###                 #
    //              #     #           #     #          #                       #  #                #
    //  ###   ##   ###    #    ##    ###    #     ##   ###   ###    ##   # #   #  #   ##    ###   ###
    // #  #  # ##   #     #     #     #     #    # ##  #     #  #  #  #  ####  ###   #  #  ##      #
    //  ##   ##     #     #     #     #     #    ##    #     #     #  #  #  #  #     #  #    ##    #
    // #      ##     ##   #    ###     ##  ###    ##   #     #      ##   #  #  #      ##   ###      ##
    //  ###
    /**
     * Gets the title of a Tumblr post.
     * @param {any} post The Tumblr post.
     * @returns {string} The title.
     */
    static getTitleFromPost(post) {
        // If it already has a title, just return it.
        if (post.title) {
            return post.title;
        }

        // If it has a track name, return it.
        if (post.track_name) {
            return post.track_name;
        }

        switch (post.type) {
            case "answer":
                return "(Q&A)";
            case "audio":
                return "(Audio)";
            case "link":
                return "(Link)";
            case "photo":
                return "(Image)";
            case "quote":
                return "(Quote)";
            case "text":
                return "(Text)";
            case "video":
                return "(Video)";
            default:
                return "(Post)";
        }
    }

    //              #    ###                 #
    //              #    #  #                #
    //  ###   ##   ###   #  #   ##    ###   ###    ###
    // #  #  # ##   #    ###   #  #  ##      #    ##
    //  ##   ##     #    #     #  #    ##    #      ##
    // #      ##     ##  #      ##   ###      ##  ###
    //  ###
    /**
     * Gets the blog posts.
     * @returns {Promise<any>} A promise that returns the blog posts.
     */
    static async getPosts() {
        const options = {
            npf: false,
            "notes_info": false,
            "reblog_info": false,
            offset: 0
        };

        const posts = [];

        do {
            const res = await tumblr.blogPosts(process.env.TUMBLR_URL, options);

            if (res.posts && res.posts.length > 0) {
                posts.push(...res.posts);

                if (res._links) {
                    options.offset += res.posts.length;
                } else {
                    options.offset = void 0;
                }
            } else {
                options.offset = void 0;
            }
        } while (options.offset !== void 0);

        return posts;
    }
}

module.exports = Tumblr;
