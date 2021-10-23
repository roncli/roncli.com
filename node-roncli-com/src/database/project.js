/**
 * @typedef {import("../../types/node/projectTypes").ProjectData} ProjectTypes.ProjectData
 * @typedef {import("../../types/node/projectTypes").ProjectMongoData} ProjectTypes.ProjectMongoData
 */

const Db = require(".");

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
}

module.exports = ProjectDb;
