/**
 * @typedef {import("@octokit/openapi-types").components["schemas"]["commit"]} Github.Commit
 * @typedef {import("@octokit/openapi-types").components["schemas"]["full-repository"]} Github.FullRepository
 * @typedef {import("@octokit/openapi-types").components["schemas"]["release"]} Github.Release
 * @typedef {import("../../types/node/githubTypes").Event} GithubTypes.Event
 */

const Octokit = require("@octokit/rest").Octokit,

    octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

//   ###     #     #     #             #
//  #   #          #     #             #
//  #       ##    ####   # ##   #   #  # ##
//  #        #     #     ##  #  #   #  ##  #
//  #  ##    #     #     #   #  #   #  #   #
//  #   #    #     #  #  #   #  #  ##  ##  #
//   ###    ###     ##   #   #   ## #  # ##
/**
 * A class that handles calls to GitHub's API.
 */
class Github {
    //              #    ####                     #
    //              #    #                        #
    //  ###   ##   ###   ###   # #    ##   ###   ###    ###
    // #  #  # ##   #    #     # #   # ##  #  #   #    ##
    //  ##   ##     #    #     # #   ##    #  #   #      ##
    // #      ##     ##  ####   #     ##   #  #    ##  ###
    //  ###
    /**
     * Gets all events for a user.
     * @returns {Promise<GithubTypes.Event[]>} A promise that returns with the events.
     */
    static getEvents() {
        return octokit.paginate(octokit.rest.activity.listPublicEventsForUser.endpoint.merge({username: "roncli", "per_page": 100}));
    }

    //              #    ###
    //              #    #  #
    //  ###   ##   ###   #  #   ##   ###    ##
    // #  #  # ##   #    ###   # ##  #  #  #  #
    //  ##   ##     #    # #   ##    #  #  #  #
    // #      ##     ##  #  #   ##   ###    ##
    //  ###                          #
    /**
     * Get a repository.
     * @param {string} owner The owner.
     * @param {string} repo The repository.
     * @returns {Promise<{repository: Github.FullRepository, commits: Github.Commit[], releases: Github.Release[]}>} A promise that returns the repository.
     */
    static async getRepository(owner, repo) {
        const [repository, commits, releases] = await Promise.all([
            (async () => {
                const res = await octokit.rest.repos.get({owner, repo});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting a repository from GitHub: status ${res.status}`);
                }

                return res.data;
            })(),
            (async () => {
                const res = await octokit.rest.repos.listCommits({owner, repo, "per_page": 100});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting commits for a repository from GitHub: status ${res.status}`);
                }

                return res.data;
            })(),
            (async () => {
                const res = await octokit.rest.repos.listReleases({owner, repo, "per_page": 100});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting releases for a repository from GitHub: status ${res.status}`);
                }

                return res.data;
            })()
        ]);

        return {repository, commits, releases};
    }
}

module.exports = Github;
