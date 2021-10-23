/**
 * @typedef {import("../../types/node/ProjectTypes").ProjectData} ProjectTypes.ProjectData
 * @typedef {import("../../types/node/ProjectTypes").RepositoryData} ProjectTypes.RepositoryData
 */

const Cache = require("@roncli/node-redis").Cache,
    Github = require("../github"),
    ProjectDb = require("../database/project"),
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
    //                   #           ###                             #     #
    //                   #           #  #                                  #
    //  ##    ###   ##   ###    ##   #  #   ##   ###    ##    ###   ##    ###    ##   ###   #  #
    // #     #  #  #     #  #  # ##  ###   # ##  #  #  #  #  ##      #     #    #  #  #  #  #  #
    // #     # ##  #     #  #  ##    # #   ##    #  #  #  #    ##    #     #    #  #  #      # #
    //  ##    # #   ##   #  #   ##   #  #   ##   ###    ##   ###    ###     ##   ##   #       #
    //                                           #                                           #
    /**
     * Caches repository information from GitHub.
     * @param {string} user The user.
     * @param {string} repository The repository.
     * @returns {Promise} A promise that resolves when the repository information has been cached.
     */
    static async cacheRepository(user, repository) {
        const repo = await Github.getRepository(user, repository);

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await Cache.add(`${process.env.REDIS_PREFIX}:github:repository:${user}:${repository}`, {
            repository: {
                url: repo.repository.html_url,
                primaryLanguage: repo.repository.language,
                createdAt: new Date(repo.repository.created_at),
                updatedAt: new Date(repo.repository.updated_at),
                description: repo.repository.description
            },
            releases: repo.releases.map((r) => ({
                name: r.name,
                body: r.body,
                createdAt: new Date(r.created_at),
                url: r.html_url
            })),
            commits: repo.commits.map((c) => ({
                author: c.author.name,
                committer: c.committer.name,
                description: c.commit.message,
                createdAt: new Date(c.commit.committer.date),
                url: c.html_url,
                sha: c.sha
            }))
        }, expire);
    }

    //       ##                       ##               #
    //        #                      #  #              #
    //  ##    #     ##    ###  ###   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #      ##    # #   ##   #  #   ##
    /**
     * Clears the project cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearCache() {
        const keys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:github:repository:*`);
        if (keys.length > 0) {
            await Cache.remove(keys);
        }
    }

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
            return (await ProjectDb.getAll()).map((f) => new Project(f)).sort((a, b) => a.order - b.order);
        } catch (err) {
            Log.error("There was an error while getting all projects.", {err});
            return [];
        }
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
     * @returns {Promise<Project>} A promise that returns the project.
     */
    static async getByPath(path) {
        const data = await ProjectDb.getByPath(path);

        if (!data) {
            return void 0;
        }

        return new Project(data);
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
        this.order = data.order;
        this.dateAdded = data.dateAdded;
        this.dateUpdated = data.dateUpdated;

        /** @type {ProjectTypes.RepositoryData} */
        this.repository = null;
    }

    // ##                   #  ###                             #     #
    //  #                   #  #  #                                  #
    //  #     ##    ###   ###  #  #   ##   ###    ##    ###   ##    ###    ##   ###   #  #
    //  #    #  #  #  #  #  #  ###   # ##  #  #  #  #  ##      #     #    #  #  #  #  #  #
    //  #    #  #  # ##  #  #  # #   ##    #  #  #  #    ##    #     #    #  #  #      # #
    // ###    ##    # #   ###  #  #   ##   ###    ##   ###    ###     ##   ##   #       #
    //                                     #                                           #
    /**
     * Loads the GitHub repository for the project.
     * @returns {Promise} A promise that resolves when the repository has been
     */
    async loadRepository() {
        if (!this.github.repository || !this.github.user) {
            return;
        }

        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:github:repository:${this.github.user}:${this.github.repository}`])) {
            await Project.cacheRepository(this.github.user, this.github.repository);
        }

        this.repository = await Cache.get(`${process.env.REDIS_PREFIX}:github:repository:${this.github.user}:${this.github.repository}`);
    }
}

module.exports = Project;
