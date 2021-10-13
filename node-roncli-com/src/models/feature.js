/**
 * @typedef {import("../../types/node/featureTypes").FeatureData} FeatureTypes.FeatureData
 */

const FeatureDb = require("../database/feature"),
    Log = require("@roncli/node-application-insights-logger");

//  #####                 #
//  #                     #
//  #       ###    ###   ####   #   #  # ##    ###
//  ####   #   #      #   #     #   #  ##  #  #   #
//  #      #####   ####   #     #   #  #      #####
//  #      #      #   #   #  #  #  ##  #      #
//  #       ###    ####    ##    ## #  #       ###
/**
 * A class that represents a feature.
 */
class Feature {
    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all features.
     * @returns {Promise<Feature[]>} A promise that returns the list of features.
     */
    static async getAll() {
        try {
            return (await FeatureDb.getAll()).map((f) => new Feature(f));
        } catch (err) {
            Log.error("There was an error while getting all features.", {err});
            return [];
        }
    }

    //              #    ###          ##                #     #                 ##            #  #  #        ##
    //              #    #  #        #  #               #                      #  #           #  #  #         #
    //  ###   ##   ###   ###   #  #   #     ##    ##   ###   ##     ##   ###   #  #  ###    ###  #  #  ###    #
    // #  #  # ##   #    #  #  #  #    #   # ##  #      #     #    #  #  #  #  ####  #  #  #  #  #  #  #  #   #
    //  ##   ##     #    #  #   # #  #  #  ##    #      #     #    #  #  #  #  #  #  #  #  #  #  #  #  #      #
    // #      ##     ##  ###     #    ##    ##    ##     ##  ###    ##   #  #  #  #  #  #   ###   ##   #     ###
    //  ###                     #
    /**
     * Gets a feature by section and URL.
     * @param {string} section The section.
     * @param {string} url The URL
     * @returns {Promise<Feature>} A promise that returns the feature.
     */
    static async getBySectionAndUrl(section, url) {
        const data = await FeatureDb.getBySectionAndUrl(section, url);

        return data ? new Feature(data) : void 0;
    }

    //              #     ##                #     #
    //              #    #  #               #
    //  ###   ##   ###    #     ##    ##   ###   ##     ##   ###
    // #  #  # ##   #      #   # ##  #      #     #    #  #  #  #
    //  ##   ##     #    #  #  ##    #      #     #    #  #  #  #
    // #      ##     ##   ##    ##    ##     ##  ###    ##   #  #
    //  ###
    /**
     * Gets all features for a section.
     * @param {string} section The section.
     * @returns {Promise<Feature[]>} A promise that returns the list of features.
     */
    static async getSection(section) {
        return (await FeatureDb.getSection(section)).map((f) => new Feature(f));
    }

    //               #     ##            #
    //               #    #  #           #
    //  ###    ##   ###   #  #  ###    ###   ##   ###
    // ##     # ##   #    #  #  #  #  #  #  # ##  #  #
    //   ##   ##     #    #  #  #     #  #  ##    #
    // ###     ##     ##   ##   #      ###   ##   #
    /**
     * Sets the order of a single feature.
     * @param {string} section The section the feature is in.
     * @param {string} url The URL of the feature.
     * @param {number} order The order to place the feature at.
     * @returns {Promise} A promise that resolves when the order has been set.
     */
    static async setOrder(section, url, order) {
        await FeatureDb.setOrder(section, url, order);
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new contact object.
     * @param {FeatureTypes.FeatureData} data The contact data.
     */
    constructor(data) {
        this.id = data._id;
        this.url = data.url;
        this.title = data.title;
        this.section = data.section;
        this.order = data.order;
        this.dateAdded = data.dateAdded;
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds the feature.
     * @returns {Promise} A promise that resolves when the feature has been added.
     */
    async add() {
        await FeatureDb.add(this);
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes the feature.
     * @returns {Promise} A promise that resolves when the feature has been deleted.
     */
    async delete() {
        await FeatureDb.delete(this);
    }
}

module.exports = Feature;
