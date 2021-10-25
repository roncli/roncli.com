/**
 * @typedef {import("../../types/node/pageTypes").PageData} PageTypes.PageData
 * @typedef {import("../../types/node/pageTypes").PageMetadata} PageTypes.PageMetadata
 * @typedef {import("../../types/node/pageTypes").PageTitle} PageTypes.PageTitle
 */

const PageDb = require("../database/page");

//  ####
//  #   #
//  #   #   ###    ## #   ###
//  ####       #  #  #   #   #
//  #       ####   ##    #####
//  #      #   #  #      #
//  #       ####   ###    ###
//                #   #
//                 ###
/**
 * A class that represents a page.
 */
class Page {
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
        await PageDb.changeParent(path, newParentPageId);
    }

    //    #        ##           #          ###         #  #         #             #         #
    //    #         #           #          #  #        ####         #             #         #
    //  ###   ##    #     ##   ###    ##   ###   #  #  ####   ##   ###    ###   ###   ###  ###    ###
    // #  #  # ##   #    # ##   #    # ##  #  #  #  #  #  #  # ##   #    #  #  #  #  #  #   #    #  #
    // #  #  ##     #    ##     #    ##    #  #   # #  #  #  ##     #    # ##  #  #  # ##   #    # ##
    //  ###   ##   ###    ##     ##   ##   ###     #   #  #   ##     ##   # #   ###   # #    ##   # #
    //                                            #
    /**
     * Deletes a page by its metadata.
     * @param {PageTypes.PageMetadata} page The page metadata.
     * @returns {Promise} A promise that resolves when the page has been deleted.
     */
    static async deleteByMetadata(page) {
        await PageDb.deleteById(page.id, page.parentPageId, page.order);
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
    static hasChildren(id) {
        return PageDb.hasChildren(id);
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
     * @returns {Promise<Page>} A promise that returns the page.
     */
    static async get(id) {
        const data = await PageDb.get(id);

        if (!data) {
            return void 0;
        }

        return new Page(data);
    }

    //              #     ##   ##    ##    #  #         #             #         #
    //              #    #  #   #     #    ####         #             #         #
    //  ###   ##   ###   #  #   #     #    ####   ##   ###    ###   ###   ###  ###    ###
    // #  #  # ##   #    ####   #     #    #  #  # ##   #    #  #  #  #  #  #   #    #  #
    //  ##   ##     #    #  #   #     #    #  #  ##     #    # ##  #  #  # ##   #    # ##
    // #      ##     ##  #  #  ###   ###   #  #   ##     ##   # #   ###   # #    ##   # #
    //  ###
    /**
     * Gets the top level pages.
     * @returns {Promise<PageTypes.PageMetadata[]>} A promise that returns the top level pages.
     */
    static async getAllMetadata() {
        const pages = await PageDb.getAllMetadata();

        if (!pages) {
            return void 0;
        }

        return pages;
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
     * @returns {Promise<Page>} A promise that returns the page.
     */
    static async getByPath(path) {
        const data = await PageDb.getByPath(path);

        if (!data) {
            return void 0;
        }

        return new Page(data);
    }

    //              #    #  #         #             #         #          ###         ###      #
    //              #    ####         #             #         #          #  #         #       #
    //  ###   ##   ###   ####   ##   ###    ###   ###   ###  ###    ###  ###   #  #   #     ###
    // #  #  # ##   #    #  #  # ##   #    #  #  #  #  #  #   #    #  #  #  #  #  #   #    #  #
    //  ##   ##     #    #  #  ##     #    # ##  #  #  # ##   #    # ##  #  #   # #   #    #  #
    // #      ##     ##  #  #   ##     ##   # #   ###   # #    ##   # #  ###     #   ###    ###
    //  ###                                                                     #
    /**
     * Gets the metadata for a page by its page ID.
     * @param {string} id The ID.
     * @returns {Promise<PageTypes.PageMetadata>}} A promise that returns the page metadata.
     */
    static async getMetadataById(id) {
        const page = await PageDb.getMetadataById(id);

        if (!page) {
            return void 0;
        }

        return page;
    }

    //              #    #  #         #             #         #          ###         ###    #     #    ##
    //              #    ####         #             #         #          #  #         #           #     #
    //  ###   ##   ###   ####   ##   ###    ###   ###   ###  ###    ###  ###   #  #   #    ##    ###    #     ##
    // #  #  # ##   #    #  #  # ##   #    #  #  #  #  #  #   #    #  #  #  #  #  #   #     #     #     #    # ##
    //  ##   ##     #    #  #  ##     #    # ##  #  #  # ##   #    # ##  #  #   # #   #     #     #     #    ##
    // #      ##     ##  #  #   ##     ##   # #   ###   # #    ##   # #  ###     #    #    ###     ##  ###    ##
    //  ###                                                                     #
    /**
     * Gets the metadata for a page by the page title.
     * @param {string} title The title.
     * @returns {Promise<PageTypes.PageMetadata>}} A promise that returns the page metadata.
     */
    static async getMetadataByTitle(title) {
        const page = await PageDb.getMetadataByTitle(title);

        if (!page) {
            return void 0;
        }

        return page;
    }

    //               #     ##            #
    //               #    #  #           #
    //  ###    ##   ###   #  #  ###    ###   ##   ###
    // ##     # ##   #    #  #  #  #  #  #  # ##  #  #
    //   ##   ##     #    #  #  #     #  #  ##    #
    // ###     ##     ##   ##   #      ###   ##   #
    /**
     * Sets the order of the child pages.
     * @param {string} id The page ID.
     * @param {number} order The order of the page.
     * @returns {Promise} A promise that resolves when the order has been set.
     */
    static async setOrder(id, order) {
        await PageDb.setOrder(id, order);
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new User object.
     * @param {PageTypes.PageData} data The page data.
     */
    constructor(data) {
        this.id = data._id;
        this.url = data.url;
        this.parentPageId = data.parentPageId;
        this.order = data.order;
        this.title = data.title;
        this.shortTitle = data.shortTitle;
        this.page = data.page;
        this.dateAdded = data.dateAdded;
        this.dateUpdated = data.dateUpdated;

        /** @type {PageTypes.PageTitle[]} */
        this.childPages = null;

        /** @type {PageTypes.PageTitle[]} */
        this.parentPages = null;

        /** @type {PageTypes.PageTitle[]} */
        this.siblingPages = null;
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds a page.
     * @returns {Promise} A promise that resolves when the page has been added.
     */
    async add() {
        await PageDb.add(this);
    }

    // ##                   #   ##   #      #    ##       #  ###
    //  #                   #  #  #  #            #       #  #  #
    //  #     ##    ###   ###  #     ###   ##     #     ###  #  #   ###   ###   ##    ###
    //  #    #  #  #  #  #  #  #     #  #   #     #    #  #  ###   #  #  #  #  # ##  ##
    //  #    #  #  # ##  #  #  #  #  #  #   #     #    #  #  #     # ##   ##   ##      ##
    // ###    ##    # #   ###   ##   #  #  ###   ###    ###  #      # #  #      ##   ###
    //                                                                    ###
    /**
     * Loads the page's child pages.
     * @returns {Promise} A proimise that resolves when the child pages have been loaded.
     */
    async loadChildPages() {
        this.childPages = await PageDb.getChildPages(this);
    }

    // ##                   #  #  #         #             #         #
    //  #                   #  ####         #             #         #
    //  #     ##    ###   ###  ####   ##   ###    ###   ###   ###  ###    ###
    //  #    #  #  #  #  #  #  #  #  # ##   #    #  #  #  #  #  #   #    #  #
    //  #    #  #  # ##  #  #  #  #  ##     #    # ##  #  #  # ##   #    # ##
    // ###    ##    # #   ###  #  #   ##     ##   # #   ###   # #    ##   # #
    /**
     * Loads the page's metadata.
     * @returns {Promise} A promise that resolves when the metadata has been loaded.
     */
    async loadMetadata() {
        if (this.childPages || this.parentPages || this.siblingPages) {
            return;
        }

        await Promise.all([
            this.loadChildPages(),
            this.loadParentPages(),
            this.loadSiblingPages()
        ]);
    }

    // ##                   #  ###                            #    ###
    //  #                   #  #  #                           #    #  #
    //  #     ##    ###   ###  #  #   ###  ###    ##   ###   ###   #  #   ###   ###   ##    ###
    //  #    #  #  #  #  #  #  ###   #  #  #  #  # ##  #  #   #    ###   #  #  #  #  # ##  ##
    //  #    #  #  # ##  #  #  #     # ##  #     ##    #  #   #    #     # ##   ##   ##      ##
    // ###    ##    # #   ###  #      # #  #      ##   #  #    ##  #      # #  #      ##   ###
    //                                                                          ###
    /**
     * Loads the page's parent pages.
     * @returns {Promise} A proimise that resolves when the parent pages have been loaded.
     */
    async loadParentPages() {
        if (!this.parentPageId) {
            return;
        }

        this.parentPages = await PageDb.getParentPages(this);
    }

    // ##                   #   ##    #    #     ##     #                ###
    //  #                   #  #  #        #      #                      #  #
    //  #     ##    ###   ###   #    ##    ###    #    ##    ###    ###  #  #   ###   ###   ##    ###
    //  #    #  #  #  #  #  #    #    #    #  #   #     #    #  #  #  #  ###   #  #  #  #  # ##  ##
    //  #    #  #  # ##  #  #  #  #   #    #  #   #     #    #  #   ##   #     # ##   ##   ##      ##
    // ###    ##    # #   ###   ##   ###   ###   ###   ###   #  #  #     #      # #  #      ##   ###
    //                                                              ###               ###
    /**
     * Loads the page's sibling pages.
     * @returns {Promise} A proimise that resolves when the sibling pages have been loaded.
     */
    async loadSiblingPages() {
        if (!this.parentPageId) {
            return;
        }

        this.siblingPages = await PageDb.getSiblingPages(this);
    }

    //                          ###
    //                          #  #
    //  ###    ###  # #    ##   #  #   ###   ###   ##
    // ##     #  #  # #   # ##  ###   #  #  #  #  # ##
    //   ##   # ##  # #   ##    #     # ##   ##   ##
    // ###     # #   #     ##   #      # #  #      ##
    //                                       ###
    /**
     * Saves a page.
     * @returns {Promise} A promise that resolves when the page has been saved.
     */
    async savePage() {
        this.dateUpdated = new Date();
        await PageDb.savePage(this);
    }

    //                          ###    #     #    ##
    //                           #           #     #
    //  ###    ###  # #    ##    #    ##    ###    #     ##
    // ##     #  #  # #   # ##   #     #     #     #    # ##
    //   ##   # ##  # #   ##     #     #     #     #    ##
    // ###     # #   #     ##    #    ###     ##  ###    ##
    /**
     * Saves a page title.
     * @returns {Promise} A promise that resolves when the page has been saved.
     */
    async saveTitle() {
        await PageDb.saveTitle(this);
    }
}

module.exports = Page;
