/**
 * @typedef {import("@googleapis/blogger").blogger_v3.Params$Resource$Comments$List} Google.Blogger.ParamsResourceCommentsList
 * @typedef {import("@googleapis/blogger").blogger_v3.Params$Resource$Posts$List} Google.Blogger.ParamsResourcePostsList
 * @typedef {import("@googleapis/blogger").blogger_v3.Schema$Comment} Google.Blogger.SchemaComment
 * @typedef {import("@googleapis/blogger").blogger_v3.Schema$Post} Google.Blogger.SchemaPost
 */

const blogger = require("@googleapis/blogger").blogger({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY
});

//  ####    ##
//   #  #    #
//   #  #    #     ###    ## #   ## #   ###   # ##
//   ###     #    #   #  #  #   #  #   #   #  ##  #
//   #  #    #    #   #   ##     ##    #####  #
//   #  #    #    #   #  #      #      #      #
//  ####    ###    ###    ###    ###    ###   #
//                       #   #  #   #
//                        ###    ###
/**
 * A class that handles calls to Google's Blogger API.
 */
class Blogger {
    //              #     ##                                  #
    //              #    #  #                                 #
    //  ###   ##   ###   #      ##   # #   # #    ##   ###   ###    ###
    // #  #  # ##   #    #     #  #  ####  ####  # ##  #  #   #    ##
    //  ##   ##     #    #  #  #  #  #  #  #  #  ##    #  #   #      ##
    // #      ##     ##   ##    ##   #  #  #  #   ##   #  #    ##  ###
    //  ###
    /**
     * Gets the comments for a blog post by ID.
     * @param {string} id The ID of the post.
     * @returns {Promise<Google.Blogger.SchemaComment[]>} A promise that returns the comments.
     */
    static async getComments(id) {
        /** @type {Google.Blogger.ParamsResourceCommentsList} */
        const params = {
            blogId: process.env.BLOGGER_BLOG_ID,
            postId: id,
            maxResults: 500,
            status: "live",
            fields: "items(author/displayName,content,id,published),nextPageToken"
        };

        /** @type {Google.Blogger.SchemaComment[]} */
        const comments = [];

        do {
            const res = await blogger.comments.list(params);
            if (res.status !== 200) {
                throw new Error(`There was an error while getting comments for a blog post from Google: status ${res.status}`);
            }

            if (res.data.items) {
                comments.push(...res.data.items);
            }

            params.pageToken = res.data.nextPageToken || void 0;
        } while (params.pageToken);

        return comments;
    }

    //              #    ###                 #
    //              #    #  #                #
    //  ###   ##   ###   #  #   ##    ###   ###
    // #  #  # ##   #    ###   #  #  ##      #
    //  ##   ##     #    #     #  #    ##    #
    // #      ##     ##  #      ##   ###      ##
    //  ###
    /**
     * Gets the blog post for an ID.
     * @param {string} id The ID of the post.
     * @returns {Promise<Google.Blogger.SchemaPost>} A promise that returns the blog post.
     */
    static async getPost(id) {
        const res = await blogger.posts.get({
            blogId: process.env.BLOGGER_BLOG_ID,
            postId: id,
            fields: "id,published,title,content"
        });
        if (res.status !== 200) {
            throw new Error(`There was an error while getting a blog post from Google: status ${res.status}`);
        }
        return res.data;
    }

    //              #    ###    #     #    ##
    //              #     #           #     #
    //  ###   ##   ###    #    ##    ###    #     ##    ###
    // #  #  # ##   #     #     #     #     #    # ##  ##
    //  ##   ##     #     #     #     #     #    ##      ##
    // #      ##     ##   #    ###     ##  ###    ##   ###
    //  ###
    /**
     * Gets the blog titles with metadata.
     * @returns {Promise<Google.Blogger.SchemaPost[]>} A promise that returns the blog titles.
     */
    static async getTitles() {
        /** @type {Google.Blogger.ParamsResourcePostsList} */
        const params = {
            blogId: process.env.BLOGGER_BLOG_ID,
            maxResults: 500,
            status: ["live"],
            fields: "items(id,labels,published,title,url),nextPageToken"
        };

        /** @type {Google.Blogger.SchemaPost[]} */
        const posts = [];

        do {
            const res = await blogger.posts.list(params);
            if (res.status !== 200) {
                throw new Error(`There was an error while getting blog titles from Google: status ${res.status}`);
            }

            posts.push(...res.data.items);

            params.pageToken = res.data.nextPageToken || void 0;
        } while (params.pageToken);

        return posts;
    }
}

module.exports = Blogger;
