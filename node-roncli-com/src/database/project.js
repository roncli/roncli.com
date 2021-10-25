/**
 * @typedef {import("../models/project")} Project
 * @typedef {import("../../types/node/projectTypes").ProjectData} ProjectTypes.ProjectData
 * @typedef {import("../../types/node/projectTypes").ProjectMongoData} ProjectTypes.ProjectMongoData
 */

const Db = require("."),
    MongoDb = require("mongodb");

//  ####                    #                  #     ####   #
//  #   #                                      #      #  #  #
//  #   #  # ##    ###     ##    ###    ###   ####    #  #  # ##
//  ####   ##  #  #   #     #   #   #  #   #   #      #  #  ##  #
//  #      #      #   #     #   #####  #       #      #  #  #   #
//  #      #      #   #     #   #      #   #   #  #   #  #  ##  #
//  #      #       ###   #  #    ###    ###     ##   ####   # ##
//                       #  #
//                        ##
/**
 * A class to handle database calls to the project collection.
 */
class ProjectDb {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds a project to the database.
     * @param {Project} project The project to add.
     * @returns {Promise} A promise that resolves when the project has been added.
     */
    static async add(project) {
        const db = await Db.get();

        const result = await db.collection("project").insertOne({
            url: project.url,
            title: project.title,
            projectUrl: project.projectUrl,
            github: project.github,
            description: project.description,
            order: project.order,
            dateAdded: project.dateAdded,
            dateUpdated: project.dateUpdated
        });

        project.id = result.insertedId.toHexString();
    }

    //                          #
    //                          #
    //  ##    ##   #  #  ###   ###
    // #     #  #  #  #  #  #   #
    // #     #  #  #  #  #  #   #
    //  ##    ##    ###  #  #    ##
    /**
     * Gets the count of all projects in the database.
     * @returns {Promise<number>} A promise that returns the number of projects.
     */
    static async count() {
        const db = await Db.get();

        return db.collection("project").countDocuments();
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Deletes a project from the database.
     * @param {Project} project The project.
     * @returns {Promise} A promise that resolves when the project has been deleted.
     */
    static async delete(project) {
        const db = await Db.get();

        await db.collection("project").updateMany({order: {$gt: project.order}}, {$inc: {order: -1}});

        await db.collection("project").deleteOne({_id: MongoDb.ObjectId.createFromHexString(project.id)});
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a project by its ID.
     * @param {string} id The ID.
     * @returns {Promise<ProjectTypes.ProjectData>} A promise that returns the project.
     */
    static async get(id) {
        const db = await Db.get();

        const project = await db.collection("project").findOne({_id: MongoDb.ObjectId.createFromHexString(id)});

        if (!project) {
            return void 0;
        }

        return {
            _id: project._id.toHexString(),
            url: project.url,
            title: project.title,
            projectUrl: project.projectUrl,
            github: {
                user: project.github.user,
                repository: project.github.repository
            },
            description: project.description,
            order: project.order,
            dateAdded: project.dateAdded,
            dateUpdated: project.dateUpdated
        };
    }

    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all projects from the database.
     * @returns {Promise<ProjectTypes.ProjectData[]>} A promise that returns the projects.
     */
    static async getAll() {
        const db = await Db.get();

        const projects = await db.collection("project").find({}).toArray();

        return projects.map((p) => ({
            _id: p._id.toHexString(),
            url: p.url,
            title: p.title,
            projectUrl: p.projectUrl,
            github: {
                user: p.github.user,
                repository: p.github.repository
            },
            description: p.description,
            order: p.order,
            dateAdded: p.dateAdded,
            dateUpdated: p.dateUpdated
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
     * Gets a project by its path.
     * @param {string} path The path.
     * @returns {Promise<ProjectTypes.ProjectData>} A promise that returns the project.
     */
    static async getByPath(path) {
        const db = await Db.get();

        const project = await db.collection("project").findOne({url: path});

        if (!project) {
            return void 0;
        }

        return {
            _id: project._id.toHexString(),
            url: project.url,
            title: project.title,
            projectUrl: project.projectUrl,
            github: {
                user: project.github.user,
                repository: project.github.repository
            },
            description: project.description,
            order: project.order,
            dateAdded: project.dateAdded,
            dateUpdated: project.dateUpdated
        };
    }

    //              #    ###         ###    #     #    ##
    //              #    #  #         #           #     #
    //  ###   ##   ###   ###   #  #   #    ##    ###    #     ##
    // #  #  # ##   #    #  #  #  #   #     #     #     #    # ##
    //  ##   ##     #    #  #   # #   #     #     #     #    ##
    // #      ##     ##  ###     #    #    ###     ##  ###    ##
    //  ###                     #
    /**
     * Gets a project by its title.
     * @param {string} title The title.
     * @returns {Promise<ProjectTypes.ProjectData>} A promise that returns the project.
     */
    static async getByTitle(title) {
        const db = await Db.get();

        const project = await db.collection("project").findOne({title});

        if (!project) {
            return void 0;
        }

        return {
            _id: project._id.toHexString(),
            url: project.url,
            title: project.title,
            projectUrl: project.projectUrl,
            github: {
                user: project.github.user,
                repository: project.github.repository
            },
            description: project.description,
            order: project.order,
            dateAdded: project.dateAdded,
            dateUpdated: project.dateUpdated
        };
    }

    //               #     ##            #
    //               #    #  #           #
    //  ###    ##   ###   #  #  ###    ###   ##   ###
    // ##     # ##   #    #  #  #  #  #  #  # ##  #  #
    //   ##   ##     #    #  #  #     #  #  ##    #
    // ###     ##     ##   ##   #      ###   ##   #
    /**
     * Sets the order of a project in the database.
     * @param {string} id The project ID.
     * @param {number} order The order of the project.
     * @returns {Promise} A promise that resolves when the order has been set.
     */
    static async setOrder(id, order) {
        const db = await Db.get();

        await db.collection("project").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(id)}, {$set: {order}});
    }
}

module.exports = ProjectDb;
