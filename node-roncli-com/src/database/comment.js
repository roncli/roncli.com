/**
 * @typedef {import("../models/comment")} Comment
 * @typedef {import("../../types/node/commentTypes").CommentData} CommentTypes.CommentData
 * @typedef {import("../../types/node/commentTypes").CommentMongoData} CommentTypes.CommentMongoData
 * @typedef {import("../models/user")} User
 */

const Db = require("."),
    MongoDb = require("mongodb");

//   ###                                       #     ####   #
//  #   #                                      #      #  #  #
//  #       ###   ## #   ## #    ###   # ##   ####    #  #  # ##
//  #      #   #  # # #  # # #  #   #  ##  #   #      #  #  ##  #
//  #      #   #  # # #  # # #  #####  #   #   #      #  #  #   #
//  #   #  #   #  # # #  # # #  #      #   #   #  #   #  #  ##  #
//   ###    ###   #   #  #   #   ###   #   #    ##   ####   # ##
/**
 * A class to handle database calls to the comment collection.
 */
class CommentDb {
    //                                #
    //                                #
    //  ###   ##    ##    ##   ###   ###
    // #  #  #     #     # ##  #  #   #
    // # ##  #     #     ##    #  #   #
    //  # #   ##    ##    ##   ###     ##
    //                         #
    /**
     * Accepts a comment.
     * @param {Comment} comment The comment to accept.
     * @returns {Promise} A promise that resolves when the comment has been accepted.
     */
    static async accept(comment) {
        const db = await Db.get();

        await db.collection("comment").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(comment.id)}, {$set: {dateModerated: comment.dateModerated}});
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds a comment.
     * @param {Comment} comment The comment to add.
     * @returns {Promise} A promise that resolves when the comment has been added.
     */
    static async add(comment) {
        const db = await Db.get();

        const data = {
            url: comment.url,
            comment: comment.comment,
            dateAdded: comment.dateAdded,
            userId: MongoDb.ObjectId.createFromHexString(comment.userId)
        };

        if (comment.dateModerated) {
            data.dateModerated = comment.dateModerated;
        }

        const result = await db.collection("comment").insertOne(data);

        if (result.acknowledged) {
            comment.id = result.insertedId.toHexString();
        }
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes a comment.
     * @param {Comment} comment The comment to delete.
     * @returns {Promise} A promise that resolves when the comment has been deleted.
     */
    static async delete(comment) {
        const db = await Db.get();

        await db.collection("comment").deleteOne({_id: MongoDb.ObjectId.createFromHexString(comment.id)});
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a comment from the database by its ID.
     * @param {string} id The comment ID.
     * @returns {Promise<CommentTypes.CommentData>} A promise that returns with the comment.
     */
    static async get(id) {
        const db = await Db.get();

        /** @type {CommentTypes.CommentMongoData[]} */
        const comments = await db.collection("comment").aggregate([
            {
                $match: {_id: MongoDb.ObjectId.createFromHexString(id)}
            },
            {
                $lookup: {
                    from: "user",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            {
                                $arrayElemAt: ["$user", 0]
                            },
                            "$$ROOT"
                        ]
                    }
                }
            },
            {
                $project: {
                    url: 1,
                    comment: 1,
                    dateAdded: 1,
                    userId: 1,
                    dateModerated: 1,
                    username: 1
                }
            },
            {
                $sort: {dateAdded: 1}
            }
        ]).toArray();

        return comments.length > 0 ? {
            _id: comments[0]._id.toHexString(),
            url: comments[0].url,
            comment: comments[0].comment,
            dateAdded: comments[0].dateAdded,
            userId: comments[0].userId.toHexString(),
            username: comments[0].username,
            dateModerated: comments[0].dateModerated
        } : void 0;
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
     * @returns {Promise<CommentTypes.CommentData[]>} A promise that returns the comments.
     */
    static async getByUrl(url, user) {
        const db = await Db.get();

        const match = {url};

        if (user && user.id) {
            match.$or = [
                {
                    dateModerated: {$exists: true}
                },
                {
                    userId: MongoDb.ObjectId.createFromHexString(user.id)
                }
            ];
        } else {
            match.dateModerated = {$exists: true};
        }

        /** @type {CommentTypes.CommentMongoData[]} */
        const comments = await db.collection("comment").aggregate([
            {
                $match: match
            },
            {
                $lookup: {
                    from: "user",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            {
                                $arrayElemAt: ["$user", 0]
                            },
                            "$$ROOT"
                        ]
                    }
                }
            },
            {
                $project: {
                    url: 1,
                    comment: 1,
                    dateAdded: 1,
                    userId: 1,
                    dateModerated: 1,
                    username: 1
                }
            },
            {
                $sort: {dateAdded: 1}
            }
        ]).toArray();

        return comments.map((c) => ({
            _id: c._id.toHexString(),
            url: c.url,
            comment: c.comment,
            dateAdded: c.dateAdded,
            userId: c.userId.toHexString(),
            username: c.username,
            dateModerated: c.dateModerated
        }));
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
     * @returns {Promise<CommentTypes.CommentData[]>} A promise that returns the comments.
     */
    static async getUnmoderated() {
        const db = await Db.get();

        /** @type {CommentTypes.CommentMongoData[]} */
        const comments = await db.collection("comment").aggregate([
            {
                $match: {
                    dateModerated: {$exists: false}
                }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            {
                                $arrayElemAt: ["$user", 0]
                            },
                            "$$ROOT"
                        ]
                    }
                }
            },
            {
                $project: {
                    url: 1,
                    comment: 1,
                    dateAdded: 1,
                    userId: 1,
                    dateModerated: 1,
                    username: 1
                }
            },
            {
                $sort: {dateAdded: 1}
            }
        ]).toArray();

        return comments.map((c) => ({
            _id: c._id.toHexString(),
            url: c.url,
            comment: c.comment,
            dateAdded: c.dateAdded,
            userId: c.userId.toHexString(),
            username: c.username,
            dateModerated: c.dateModerated
        }));
    }

    //                #                     #
    //                #                     #
    // # #    ##    ###   ##   ###    ###  ###    ##
    // ####  #  #  #  #  # ##  #  #  #  #   #    # ##
    // #  #  #  #  #  #  ##    #     # ##   #    ##
    // #  #   ##    ###   ##   #      # #    ##   ##
    /**
     * Moderates a comment.
     * @param {Comment} comment The comment to moderate.
     * @returns {Promise} A promise that resolves when the comment has been moderated.
     */
    static async moderate(comment) {
        const db = await Db.get();

        comment.dateModerated = new Date();

        await db.collection("comment").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(comment.id)}, {$set: {dateModerated: comment.dateModerated}});
    }
}

module.exports = CommentDb;
