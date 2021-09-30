/**
 * @typedef {import("../models/feature")} Feature
 * @typedef {import("../../types/node/featureTypes").FeatureData} FeatureTypes.FeatureData
 * @typedef {import("../../types/node/featureTypes").FeatureMongoData} FeatureTypes.FeatureMongoData
 */

const Db = require("."),
    MongoDb = require("mongodb");

//  #####                 #                          ####   #
//  #                     #                           #  #  #
//  #       ###    ###   ####   #   #  # ##    ###    #  #  # ##
//  ####   #   #      #   #     #   #  ##  #  #   #   #  #  ##  #
//  #      #####   ####   #     #   #  #      #####   #  #  #   #
//  #      #      #   #   #  #  #  ##  #      #       #  #  ##  #
//  #       ###    ####    ##    ## #  #       ###   ####   # ##
/**
 * A class to handle database calls to the feature collection.
 */
class FeatureDb {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds the feature to the database.
     * @param {Feature} feature The feature to add.
     * @returns {Promise} A promise that resolves when the feature has been added.
     */
    static async add(feature) {
        const db = await Db.get();

        const result = await db.collection("feature").insertOne({
            section: feature.section,
            url: feature.url,
            title: feature.title,
            order: feature.order,
            dateAdded: feature.dateAdded
        });

        if (result.acknowledged) {
            feature.id = result.insertedId.toHexString();
        }
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes the feature from the database.
     * @param {Feature} feature The feature to delete.
     * @returns {Promise} A promise that resolves when the feature has been deleted.
     */
    static async delete(feature) {
        const db = await Db.get();

        await db.collection("feature").deleteOne({_id: MongoDb.ObjectId.createFromHexString(feature.id)});
    }

    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all features from the database.
     * @returns {Promise<FeatureTypes.FeatureData[]>} A promise that returns the features.
     */
    static async getAll() {
        const db = await Db.get();

        const features = await db.collection("feature").find({}).toArray();

        return features.map((f) => ({
            _id: f._id.toHexString(),
            url: f.url,
            title: f.title,
            section: f.section,
            order: f.order,
            dateAdded: f.dateAdded
        }));
    }

    //              #    ###          ##                #     #                 ##            #  #  #        ##
    //              #    #  #        #  #               #                      #  #           #  #  #         #
    //  ###   ##   ###   ###   #  #   #     ##    ##   ###   ##     ##   ###   #  #  ###    ###  #  #  ###    #
    // #  #  # ##   #    #  #  #  #    #   # ##  #      #     #    #  #  #  #  ####  #  #  #  #  #  #  #  #   #
    //  ##   ##     #    #  #   # #  #  #  ##    #      #     #    #  #  #  #  #  #  #  #  #  #  #  #  #      #
    // #      ##     ##  ###     #    ##    ##    ##     ##  ###    ##   #  #  #  #  #  #   ###   ##   #     ###
    //  ###                     #
    /**
     * Gets a feature by section and URL from the database.
     * @param {string} section The section.
     * @param {string} url The URL
     * @returns {Promise<FeatureTypes.FeatureData>} A promise that returns the feature.
     */
    static async getBySectionAndUrl(section, url) {
        const db = await Db.get();

        const feature = await db.collection("feature").findOne({section, url});

        return feature ? {
            _id: feature._id.toHexString(),
            url: feature.url,
            title: feature.title,
            section: feature.section,
            order: feature.order,
            dateAdded: feature.dateAdded
        } : void 0;
    }

    //              #     ##                #     #
    //              #    #  #               #
    //  ###   ##   ###    #     ##    ##   ###   ##     ##   ###
    // #  #  # ##   #      #   # ##  #      #     #    #  #  #  #
    //  ##   ##     #    #  #  ##    #      #     #    #  #  #  #
    // #      ##     ##   ##    ##    ##     ##  ###    ##   #  #
    //  ###
    /**
     * Gets all features by section from the database.
     * @param {string} section The section.
     * @returns {Promise<FeatureTypes.FeatureData[]>} A promise that returns the features.
     */
    static async getSection(section) {
        const db = await Db.get();

        const features = await db.collection("feature").find({section}).toArray();

        return features.map((f) => ({
            _id: f._id.toHexString(),
            url: f.url,
            title: f.title,
            section: f.section,
            order: f.order,
            dateAdded: f.dateAdded
        }));
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
        const db = await Db.get();

        await db.collection("feature").updateOne({section, url}, {$set: {order}});
    }
}

module.exports = FeatureDb;
