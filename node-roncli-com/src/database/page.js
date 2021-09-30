/**
 * @typedef {import("../models/page")} Page
 * @typedef {import("../../types/node/pageTypes").PageData} PageTypes.PageData
 * @typedef {import("../../types/node/pageTypes").PageMetadata} PageTypes.PageMetadata
 * @typedef {import("../../types/node/pageTypes").PageMongoData} PageTypes.PageMongoData
 * @typedef {import("../../types/node/pageTypes").PageTitle} PageTypes.PageTitle
 */

const Db = require("."),
    MongoDb = require("mongodb");

//  ####                        ####   #
//  #   #                        #  #  #
//  #   #   ###    ## #   ###    #  #  # ##
//  ####       #  #  #   #   #   #  #  ##  #
//  #       ####   ##    #####   #  #  #   #
//  #      #   #  #      #       #  #  ##  #
//  #       ####   ###    ###   ####   # ##
//                #   #
//                 ###
/**
 * A class to handle database calls to the project collection.
 */
class PageDb {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds a page to the database.
     * @param {Page} page The page to add.
     * @returns {Promise} A promise that resolves when the page has been added to the database.
     */
    static async add(page) {
        const db = await Db.get();

        /**
         * @type {PageTypes.PageMongoData}
         */
        const data = {
            url: page.url,
            order: page.order,
            title: page.title,
            shortTitle: page.shortTitle,
            page: page.page,
            dateAdded: page.dateAdded,
            dateUpdated: page.dateUpdated
        };

        if (page.order) {
            data.order = page.order;
        }

        if (page.parentPageId) {
            data.parentPageId = MongoDb.ObjectId.createFromHexString(page.parentPageId);
        }

        const result = await db.collection("page").insertOne(data);

        page.id = result.insertedId.toHexString();
    }

    //       #                             ###                            #
    //       #                             #  #                           #
    //  ##   ###    ###  ###    ###   ##   #  #   ###  ###    ##   ###   ###
    // #     #  #  #  #  #  #  #  #  # ##  ###   #  #  #  #  # ##  #  #   #
    // #     #  #  # ##  #  #   ##   ##    #     # ##  #     ##    #  #   #
    //  ##   #  #   # #  #  #  #      ##   #      # #  #      ##   #  #    ##
    //                          ###
    /**
     * Changes the parent of the specified page.
     * @param {string} path The path.
     * @param {string} newParentPageId The ID of the new parent.
     * @returns {Promise} A promise that resolves when the page has been assigned the new parent.
     */
    static async changeParent(path, newParentPageId) {
        const db = await Db.get();

        const pages = await db.collection("page").find({url: path}).project({_id: 1, parentPageId: 1, order: 1}).toArray();

        if (pages && pages.length > 0) {
            const page = pages[0];

            if (page.parentPageId) {
                await db.collection("page").updateMany({parentPageId: page.parentPageId, order: {$gt: page.order}}, {$inc: {order: -1}});
            }
        }

        const order = await db.collection("page").count({parentPageId: newParentPageId ? MongoDb.ObjectId.createFromHexString(newParentPageId) : {$exists: false}}) + 1;

        await db.collection("page").findOneAndUpdate({url: path}, newParentPageId ? {$set: {parentPageId: MongoDb.ObjectId.createFromHexString(newParentPageId), order}} : {$unset: {parentPageId: "", order: ""}});
    }

    //    #        ##           #          ###         ###      #
    //    #         #           #          #  #         #       #
    //  ###   ##    #     ##   ###    ##   ###   #  #   #     ###
    // #  #  # ##   #    # ##   #    # ##  #  #  #  #   #    #  #
    // #  #  ##     #    ##     #    ##    #  #   # #   #    #  #
    //  ###   ##   ###    ##     ##   ##   ###     #   ###    ###
    //                                            #
    /**
     * Deletes a page from the database by its ID.
     * @param {string} id The page ID.
     * @param {string} parentPageId The parent page ID.
     * @param {number} order The order.
     * @returns {Promise} A promise that resolves when the page has been deleted.
     */
    static async deleteById(id, parentPageId, order) {
        const db = await Db.get();

        if (parentPageId) {
            await db.collection("page").updateMany({parentPageId: parentPageId ? MongoDb.ObjectId.createFromHexString(parentPageId) : {$exists: false}, $and: [{order: {$exists: true}}, {order: {$gt: order}}]}, {$inc: {order: -1}});
        }

        await db.collection("page").deleteOne({_id: MongoDb.ObjectId.createFromHexString(id)});
    }

    // #                   ##   #      #    ##       #
    // #                  #  #  #            #       #
    // ###    ###   ###   #     ###   ##     #     ###  ###    ##   ###
    // #  #  #  #  ##     #     #  #   #     #    #  #  #  #  # ##  #  #
    // #  #  # ##    ##   #  #  #  #   #     #    #  #  #     ##    #  #
    // #  #   # #  ###     ##   #  #  ###   ###    ###  #      ##   #  #
    /**
     * Determines if a page has children by its ID.
     * @param {string} id The page ID.
     * @returns {Promise<boolean>} A promise that returns whether the page has children.
     */
    static async hasChildren(id) {
        const db = await Db.get();

        return !!await db.collection("page").find({parentPageId: MongoDb.ObjectId.createFromHexString(id)}).limit(1).count();
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a page by its ID.
     * @param {string} id The ID.
     * @returns {Promise<PageTypes.PageData>} A promise that returns the page.
     */
    static async get(id) {
        const db = await Db.get();

        const page = await db.collection("page").findOne({_id: MongoDb.ObjectId.createFromHexString(id)});

        if (!page) {
            return void 0;
        }

        return {
            _id: page._id.toHexString(),
            url: page.url,
            parentPageId: page.parentPageId ? page.parentPageId.toHexString() : void 0,
            order: page.order,
            title: page.title,
            shortTitle: page.shortTitle,
            page: page.page,
            dateAdded: page.dateAdded,
            dateUpdated: page.dateUpdated
        };
    }

    //              #     ##   ##    ##    #  #         #             #         #
    //              #    #  #   #     #    ####         #             #         #
    //  ###   ##   ###   #  #   #     #    ####   ##   ###    ###   ###   ###  ###    ###
    // #  #  # ##   #    ####   #     #    #  #  # ##   #    #  #  #  #  #  #   #    #  #
    //  ##   ##     #    #  #   #     #    #  #  ##     #    # ##  #  #  # ##   #    # ##
    // #      ##     ##  #  #  ###   ###   #  #   ##     ##   # #   ###   # #    ##   # #
    //  ###
    /**
     * Gets page metadata.
     * @returns {Promise<PageTypes.PageMetadata[]>} A promise that returns the page metadata.
     */
    static async getAllMetadata() {
        const db = await Db.get();

        const pages = await db.collection("page").find({}).project({_id: 1, url: 1, parentPageId: 1, title: 1, shortTitle: 1, order: 1}).toArray();

        return pages.sort((a, b) => a.title.localeCompare(b.title)).map((p) => ({
            id: p._id.toHexString(),
            url: p.url,
            parentPageId: p.parentPageId ? p.parentPageId.toHexString() : void 0,
            title: p.title,
            shortTitle: p.shortTitle,
            order: p.order
        }));
    }

    //              #    ###         ###          #    #
    //              #    #  #        #  #         #    #
    //  ###   ##   ###   ###   #  #  #  #   ###  ###   ###
    // #  #  # ##   #    #  #  #  #  ###   #  #   #    #  #
    //  ##   ##     #    #  #   # #  #     # ##   #    #  #
    // #      ##     ##  ###     #   #      # #    ##  #  #
    //  ###                     #
    /**
     * Gets a page by its path.
     * @param {string} path The path.
     * @returns {Promise<PageTypes.PageData>} A promise that returns the page.
     */
    static async getByPath(path) {
        const db = await Db.get();

        const page = await db.collection("page").findOne({url: path});

        if (!page) {
            return void 0;
        }

        return {
            _id: page._id.toHexString(),
            url: page.url,
            parentPageId: page.parentPageId ? page.parentPageId.toHexString() : void 0,
            order: page.order,
            title: page.title,
            shortTitle: page.shortTitle,
            page: page.page,
            dateAdded: page.dateAdded,
            dateUpdated: page.dateUpdated
        };
    }

    //              #     ##   #      #    ##       #  ###
    //              #    #  #  #            #       #  #  #
    //  ###   ##   ###   #     ###   ##     #     ###  #  #   ###   ###   ##    ###
    // #  #  # ##   #    #     #  #   #     #    #  #  ###   #  #  #  #  # ##  ##
    //  ##   ##     #    #  #  #  #   #     #    #  #  #     # ##   ##   ##      ##
    // #      ##     ##   ##   #  #  ###   ###    ###  #      # #  #      ##   ###
    //  ###                                                         ###
    /**
     * Gets the page's child pages.
     * @param {Page} page The page object.
     * @returns {Promise<PageTypes.PageTitle[]>} A promise that returns the child pages.
     */
    static async getChildPages(page) {
        const db = await Db.get();

        const pages = await db.collection("page").find({parentPageId: MongoDb.ObjectId.createFromHexString(page.id)}).toArray();

        return pages.sort((a, b) => a.order - b.order).map((p) => ({
            url: p.url,
            shortTitle: p.shortTitle
        }));
    }

    //              #    #  #         #             #         #          ###         ###      #
    //              #    ####         #             #         #          #  #         #       #
    //  ###   ##   ###   ####   ##   ###    ###   ###   ###  ###    ###  ###   #  #   #     ###
    // #  #  # ##   #    #  #  # ##   #    #  #  #  #  #  #   #    #  #  #  #  #  #   #    #  #
    //  ##   ##     #    #  #  ##     #    # ##  #  #  # ##   #    # ##  #  #   # #   #    #  #
    // #      ##     ##  #  #   ##     ##   # #   ###   # #    ##   # #  ###     #   ###    ###
    //  ###                                                                     #
    /**
     * Gets the metadata for a single page by its page ID.
     * @param {string} id The page ID.
     * @returns {Promise<PageTypes.PageMetadata>} A promise that returns the page metadata.
     */
    static async getMetadataById(id) {
        const db = await Db.get();

        const page = await db.collection("page").findOne({_id: MongoDb.ObjectId.createFromHexString(id)}, {
            projection: {_id: 1, url: 1, parentPageId: 1, title: 1, shortTitle: 1, order: 1}
        });

        if (!page) {
            return void 0;
        }

        return {
            id: page._id.toHexString(),
            url: page.url,
            parentPageId: page.parentPageId ? page.parentPageId.toHexString() : void 0,
            title: page.title,
            shortTitle: page.shortTitle,
            order: page.order
        };
    }

    //              #    #  #         #             #         #          ###         ###    #     #    ##
    //              #    ####         #             #         #          #  #         #           #     #
    //  ###   ##   ###   ####   ##   ###    ###   ###   ###  ###    ###  ###   #  #   #    ##    ###    #     ##
    // #  #  # ##   #    #  #  # ##   #    #  #  #  #  #  #   #    #  #  #  #  #  #   #     #     #     #    # ##
    //  ##   ##     #    #  #  ##     #    # ##  #  #  # ##   #    # ##  #  #   # #   #     #     #     #    ##
    // #      ##     ##  #  #   ##     ##   # #   ###   # #    ##   # #  ###     #    #    ###     ##  ###    ##
    //  ###                                                                     #
    /**
     * Gets the metadata for a single page by the page title.
     * @param {string} title The page title.
     * @returns {Promise<PageTypes.PageMetadata>} A promise that returns the page metadata.
     */
    static async getMetadataByTitle(title) {
        const db = await Db.get();

        const page = await db.collection("page").findOne({title}, {
            projection: {_id: 1, url: 1, parentPageId: 1, title: 1, shortTitle: 1, order: 1}
        });

        if (!page) {
            return void 0;
        }

        return {
            id: page._id.toHexString(),
            url: page.url,
            parentPageId: page.parentPageId ? page.parentPageId.toHexString() : void 0,
            title: page.title,
            shortTitle: page.shortTitle,
            order: page.order
        };
    }

    //              #    ###                            #    ###
    //              #    #  #                           #    #  #
    //  ###   ##   ###   #  #   ###  ###    ##   ###   ###   #  #   ###   ###   ##    ###
    // #  #  # ##   #    ###   #  #  #  #  # ##  #  #   #    ###   #  #  #  #  # ##  ##
    //  ##   ##     #    #     # ##  #     ##    #  #   #    #     # ##   ##   ##      ##
    // #      ##     ##  #      # #  #      ##   #  #    ##  #      # #  #      ##   ###
    //  ###                                                               ###
    /**
     * Gets the page's parent pages.
     * @param {Page} page The page object.
     * @returns {Promise<PageTypes.PageTitle[]>} A promise that returns the parent pages.
     */
    static async getParentPages(page) {
        const db = await Db.get();

        /** @type {PageTypes.PageTitle[]} */
        const pages = [];

        let currentPageId = MongoDb.ObjectId.createFromHexString(page.parentPageId);

        while (currentPageId) {
            const currentPage = await db.collection("page").findOne({_id: currentPageId});

            pages.push({
                url: currentPage.url,
                shortTitle: currentPage.shortTitle
            });

            currentPageId = currentPage.parentPageId;
        }

        pages.reverse();

        return pages;
    }

    //              #     ##    #    #     ##     #                ###
    //              #    #  #        #      #                      #  #
    //  ###   ##   ###    #    ##    ###    #    ##    ###    ###  #  #   ###   ###   ##    ###
    // #  #  # ##   #      #    #    #  #   #     #    #  #  #  #  ###   #  #  #  #  # ##  ##
    //  ##   ##     #    #  #   #    #  #   #     #    #  #   ##   #     # ##   ##   ##      ##
    // #      ##     ##   ##   ###   ###   ###   ###   #  #  #     #      # #  #      ##   ###
    //  ###                                                   ###               ###
    /**
     * Gets the page's sibling pages.
     * @param {Page} page The page object.
     * @returns {Promise<PageTypes.PageTitle[]>} A promise that returns the sibling pages.
     */
    static async getSiblingPages(page) {
        const db = await Db.get();

        const pages = await db.collection("page").find({parentPageId: page.parentPageId ? MongoDb.ObjectId.createFromHexString(page.parentPageId) : {$exists: false}}).toArray();

        return pages.sort((a, b) => a.order - b.order).map((p) => ({
            url: p.url,
            shortTitle: p.shortTitle
        }));
    }

    //                          ###
    //                          #  #
    //  ###    ###  # #    ##   #  #   ###   ###   ##
    // ##     #  #  # #   # ##  ###   #  #  #  #  # ##
    //   ##   # ##  # #   ##    #     # ##   ##   ##
    // ###     # #   #     ##   #      # #  #      ##
    //                                       ###
    /**
     * Saves an existing page to the database.
     * @param {Page} page The page to save.
     * @returns {Promise} A promise that resolves when the page has been saved.
     */
    static async savePage(page) {
        const db = await Db.get();

        await db.collection("page").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(page.id)}, {$set: {page: page.page, dateUpdated: page.dateUpdated}});
    }

    //                          ###    #     #    ##
    //                           #           #     #
    //  ###    ###  # #    ##    #    ##    ###    #     ##
    // ##     #  #  # #   # ##   #     #     #     #    # ##
    //   ##   # ##  # #   ##     #     #     #     #    ##
    // ###     # #   #     ##    #    ###     ##  ###    ##
    /**
     * Saves an existing page's title to the database.
     * @param {Page} page The page to save.
     * @returns {Promise} A promise that resolves when the page's title has been saved.
     */
    static async saveTitle(page) {
        const db = await Db.get();

        await db.collection("page").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(page.id)}, {$set: {title: page.title, shortTitle: page.shortTitle}});
    }

    //               #     ##            #
    //               #    #  #           #
    //  ###    ##   ###   #  #  ###    ###   ##   ###
    // ##     # ##   #    #  #  #  #  #  #  # ##  #  #
    //   ##   ##     #    #  #  #     #  #  ##    #
    // ###     ##     ##   ##   #      ###   ##   #
    /**
     * Sets the order for a page.
     * @param {string} id The page ID.
     * @param {number} order The order.
     * @returns {Promise} A promise that resolves when the order has been set.
     */
    static async setOrder(id, order) {
        const db = await Db.get();

        await db.collection("page").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(id)}, {$set: {order}});
    }
}

module.exports = PageDb;
