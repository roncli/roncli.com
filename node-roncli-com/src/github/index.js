// TODO: Determine if authorization is needed

/**
 * @typedef {import("../../types/node/githubTypes").Event} GithubTypes.Event
 */

const Octokit = require("@octokit/rest").Octokit,
    github = new Octokit();

//   ###     #     #     #             #
//  #   #          #     #             #
//  #       ##    ####   # ##   #   #  # ##
//  #        #     #     ##  #  #   #  ##  #
//  #  ##    #     #     #   #  #   #  #   #
//  #   #    #     #  #  #   #  #  ##  ##  #
//   ###    ###     ##   #   #   ## #  # ##
/**
 * A class that handles calls to Github's API.
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
        return github.paginate(github.rest.activity.listPublicEventsForUser.endpoint.merge({username: "roncli", "per_page": 100}));
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
     * @returns {Promise<{repository: object, commits: object[], releases: object[]}>} A promise that returns the repository.
     */
    static async getRepository(owner, repo) {
        let repository, commits, releases;

        await Promise.all([
            (async () => {
                const res = await github.rest.repos.get({owner, repo});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting a repository from Github: status ${res.status}`);
                }

                repository = res.data;
            })(),
            (async () => {
                const res = await github.rest.repos.listCommits({owner, repo, "per_page": 100});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting commits for a repository from Github: status ${res.status}`);
                }

                commits = res.data;
            })(),
            (async () => {
                const res = await github.rest.repos.listReleases({owner, repo, "per_page": 100});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting releases for a repository from Github: status ${res.status}`);
                }

                releases = res.data;
            })()
        ]);

        return {repository, commits, releases};
    }
}

module.exports = Github;
