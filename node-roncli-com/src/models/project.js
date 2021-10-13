/**
 * @typedef {import("../../types/node/ProjectTypes").ProjectData} ProjectTypes.ProjectData
 */

const ProjectDb = require("../database/project"),
    Log = require("@roncli/node-application-insights-logger");

//  ####                    #                  #
//  #   #                                      #
//  #   #  # ##    ###     ##    ###    ###   ####
//  ####   ##  #  #   #     #   #   #  #   #   #
//  #      #      #   #     #   #####  #       #
//  #      #      #   #     #   #      #   #   #  #
//  #      #       ###   #  #    ###    ###     ##
//                       #  #
//                        ##
/**
 * A class that represents a project.
 */
class Project {
    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all projects.
     * @returns {Promise<Project[]>} A promise that returns the list of projects.
     */
    static async getAll() {
        try {
            return (await ProjectDb.getAll()).map((f) => new Project(f));
        } catch (err) {
            Log.error("There was an error while getting all projects.", {err});
            return [];
        }
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new contact object.
     * @param {ProjectTypes.ProjectData} data The contact data.
     */
    constructor(data) {
        this.id = data._id;
        this.url = data.url;
        this.title = data.title;
        this.projectUrl = data.projectUrl;
        this.github = data.github;
        this.description = data.description;
        this.dateAdded = data.dateAdded;
        this.dateUpdated = data.dateUpdated;
    }
}

module.exports = Project;
