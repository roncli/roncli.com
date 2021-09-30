/**
 * @typedef {import("../../types/node/commentTypes").CommentData} CommentTypes.CommentData
 * @typedef {import("./user")} User
 */

const CommentDb = require("../database/comment"),
    Log = require("node-application-insights-logger"),
    sanitizeHtml = require("sanitize-html");

//   ###                                       #
//  #   #                                      #
//  #       ###   ## #   ## #    ###   # ##   ####
//  #      #   #  # # #  # # #  #   #  ##  #   #
//  #      #   #  # # #  # # #  #####  #   #   #
//  #   #  #   #  # # #  # # #  #      #   #   #  #
//   ###    ###   #   #  #   #   ###   #   #    ##
/**
 * A class that represents a comment.
 */
class Comment {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a comment by its ID.
     * @param {string} id The comment ID.
     * @returns {Promise<Comment>} A promise that returns with the comment.
     */
    static async get(id) {
        const comment = await CommentDb.get(id);

        if (!comment) {
            return void 0;
        }

        return new Comment(comment);
    }

    //              #    ###         #  #        ##
    //              #    #  #        #  #         #
    //  ###   ##   ###   ###   #  #  #  #  ###    #
    // #  #  # ##   #    #  #  #  #  #  #  #  #   #
    //  ##   ##     #    #  #   # #  #  #  #      #
    // #      ##     ##  ###     #    ##   #     ###
    //  ###                     #
    /**
     * Gets all moderated comments by a URL.
     * @param {string} url The URL to get comments for.
     * @param {User} user The user requesting the comments.
     * @returns {Promise<Comment[]>} A promise that returns the comments.
     */
    static async getByUrl(url, user) {
        try {
            return (await CommentDb.getByUrl(url, user)).map((c) => new Comment(c));
        } catch (err) {
            Log.error("There was an error while getting comments for a URL.", {err});
            return [];
        }
    }

    //              #    #  #                       #                     #             #
    //              #    #  #                       #                     #             #
    //  ###   ##   ###   #  #  ###   # #    ##    ###   ##   ###    ###  ###    ##    ###
    // #  #  # ##   #    #  #  #  #  ####  #  #  #  #  # ##  #  #  #  #   #    # ##  #  #
    //  ##   ##     #    #  #  #  #  #  #  #  #  #  #  ##    #     # ##   #    ##    #  #
    // #      ##     ##   ##   #  #  #  #   ##    ###   ##   #      # #    ##   ##    ###
    //  ###
    /**
     * Gets all unmoderated comments.
     * @returns {Promise<Comment[]>} A promise that returns the comments.
     */
    static async getUnmoderated() {
        return (await CommentDb.getUnmoderated()).map((c) => new Comment(c));
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new comment object.
     * @param {CommentTypes.CommentData} data The comment data.
     */
    constructor(data) {
        this.id = data._id;
        this.url = data.url;
        this.comment = sanitizeHtml(data.comment);
        this.dateAdded = data.dateAdded;
        this.userId = data.userId;
        this.username = data.username;
        this.dateModerated = data.dateModerated;
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds the comment.
     * @returns {Promise} A promise that resolves when the comment has been added.
     */
    async add() {
        await CommentDb.add(this);
    }

    //                                #
    //                                #
    //  ###   ##    ##    ##   ###   ###
    // #  #  #     #     # ##  #  #   #
    // # ##  #     #     ##    #  #   #
    //  # #   ##    ##    ##   ###     ##
    //                         #
    /**
     * Accepts a comment.
     * @returns {Promise} A promise that resolves when the comment has been accepted.
     */
    async accept() {
        this.dateModerated = new Date();
        await CommentDb.accept(this);
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes a comment
     * @returns {Promise} A promise that resolves when the comment has been deleted.
     */
    async delete() {
        await CommentDb.delete(this);
    }
}

module.exports = Comment;
