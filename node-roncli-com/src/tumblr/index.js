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
        if (post && post.layout && post.layout[0] && post.layout[0].type === "ask") {
            return "(Q&A)";
        }

        if (post && post.content && post.content.length > 0) {
            {
                // Get titles of audio posts.
                const content = post.content.find((c) => c.type === "audio");
                if (content) {
                    return content.title || "(Audio)";
                }
            }
            {
                // Get titles of chat posts.
                const content = post.content.find((c) => c.type === "text" && c.subtype === "chat");
                if (content) {
                    return "(Chat)";
                }
            }
            {
                // Get titles of chat posts.
                const content = post.content.find((c) => c.type === "image");
                if (content) {
                    return "(Image)";
                }
            }
            {
                // Get titles of chat posts.
                const content = post.content.find((c) => c.type === "link");
                if (content) {
                    return content.title || "(Link)";
                }
            }
            {
                // Get titles of quote posts.
                const content = post.content.find((c) => c.type === "text" && c.subtype === "quote");
                if (content) {
                    return "(Quote)";
                }
            }
            {
                // Get titles of text posts.
                const content = post.content.find((c) => c.type === "text" && c.subtype === "heading1");
                if (content) {
                    return content.text || "(Post)";
                }
            }
            {
                // Get titles of quote posts.
                const content = post.content.find((c) => c.type === "video");
                if (content) {
                    return "(Video)";
                }
            }
        }

        // Use a generic title.
        return "(Post)";
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
            npf: true,
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
