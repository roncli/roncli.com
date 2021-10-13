/**
 * @typedef {import("../../types/node/trackTypes").Track} TrackTypes.Track
 */

const request = require("@root/request");

/** @type {string} */
let accessToken = null;

/** @type {Date} */
let expiration = null;

/** @type {string} */
let refreshToken = null;

//   ###                            #          ##                      #
//  #   #                           #           #                      #
//  #       ###   #   #  # ##    ## #   ###     #     ###   #   #   ## #
//   ###   #   #  #   #  ##  #  #  ##  #   #    #    #   #  #   #  #  ##
//      #  #   #  #   #  #   #  #   #  #        #    #   #  #   #  #   #
//  #   #  #   #  #  ##  #   #  #  ##  #   #    #    #   #  #  ##  #  ##
//   ###    ###    ## #  #   #   ## #   ###    ###    ###    ## #   ## #
/**
 * A class that handles calls to Soundcloud's API.
 */
class Soundcloud {
    //                                       ###         #
    //                                        #          #
    //  ###   ##    ##    ##    ###    ###    #     ##   # #    ##   ###
    // #  #  #     #     # ##  ##     ##      #    #  #  ##    # ##  #  #
    // # ##  #     #     ##      ##     ##    #    #  #  # #   ##    #  #
    //  # #   ##    ##    ##   ###    ###     #     ##   #  #   ##   #  #
    /**
     * Gets the access token.
     * @returns {string} The access token.
     */
    static get accessToken() {
        return accessToken;
    }

    /**
     * Sets the access token.
     * @param {string} token The access token.
     */
    static set accessToken(token) {
        accessToken = token;
    }

    //                    #                 #     #
    //                                      #
    //  ##   #  #  ###   ##    ###    ###  ###   ##     ##   ###
    // # ##   ##   #  #   #    #  #  #  #   #     #    #  #  #  #
    // ##     ##   #  #   #    #     # ##   #     #    #  #  #  #
    //  ##   #  #  ###   ###   #      # #    ##  ###    ##   #  #
    //             #
    /**
     * Gets the expiration date.
     * @returns {Date} The expiration date.
     */
    static get expiration() {
        return expiration;
    }

    /**
     * Sets the expiration date.
     * @param {Date} date The expiration date.
     */
    static set expiration(date) {
        expiration = date;
    }

    //               #                      #     ###         #
    //              # #                     #      #          #
    // ###    ##    #    ###    ##    ###   ###    #     ##   # #    ##   ###
    // #  #  # ##  ###   #  #  # ##  ##     #  #   #    #  #  ##    # ##  #  #
    // #     ##     #    #     ##      ##   #  #   #    #  #  # #   ##    #  #
    // #      ##    #    #      ##   ###    #  #   #     ##   #  #   ##   #  #
    /**
     * Gets the refresh token.
     * @returns {string} The refresh token.
     */
    static get refreshToken() {
        return refreshToken;
    }

    /**
     * Sets the refresh token.
     * @param {string} token The refresh token.
     */
    static set refreshToken(token) {
        refreshToken = token;
    }

    //              #     ##                                   ###         #
    //              #    #  #                                   #          #
    //  ###   ##   ###   #  #   ##    ##    ##    ###    ###    #     ##   # #    ##   ###
    // #  #  # ##   #    ####  #     #     # ##  ##     ##      #    #  #  ##    # ##  #  #
    //  ##   ##     #    #  #  #     #     ##      ##     ##    #    #  #  # #   ##    #  #
    // #      ##     ##  #  #   ##    ##    ##   ###    ###     #     ##   #  #   ##   #  #
    //  ###
    /**
     * Gets the access token via OAuth from SoundCloud.
     * @returns {Promise} A promise that resolves when the token has been retrieved.
     */
    static async getAccessToken() {
        const res = await request.post({
            uri: "https://api.soundcloud.com/oauth2/token",
            form: {
                "grant_type": "client_credentials",
                "client_id": process.env.SOUNDCLOUD_CLIENT_ID,
                "client_secret": process.env.SOUNDCLOUD_CLIENT_SECRET
            },
            json: true
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting a new access token from Soundcloud: status ${res.statusCode}`);
        }

        if (!res.body) {
            throw new Error("Soundcloud did not return any data while getting a new access token.");
        }

        Soundcloud.accessToken = res.body.access_token;
        Soundcloud.refreshToken = res.body.refresh_token;
        Soundcloud.expiration = new Date(new Date().getTime() + 1000 * (res.body.expires_in - 30));
    }

    //              #    ###         #
    //              #     #          #
    //  ###   ##   ###    #     ##   # #    ##   ###
    // #  #  # ##   #     #    #  #  ##    # ##  #  #
    //  ##   ##     #     #    #  #  # #   ##    #  #
    // #      ##     ##   #     ##   #  #   ##   #  #
    //  ###
    /**
     * Gets an OAuth client credential token from Soundcloud.
     * @returns {Promise<string>} The token.
     */
    static async getToken() {
        if (!expiration || expiration < new Date()) {
            if (expiration) {
                await Soundcloud.refreshAccessToken();
            } else {
                await Soundcloud.getAccessToken();
            }
        }

        return Soundcloud.accessToken;
    }

    //              #    ###                     #
    //              #     #                      #
    //  ###   ##   ###    #    ###    ###   ##   # #    ###
    // #  #  # ##   #     #    #  #  #  #  #     ##    ##
    //  ##   ##     #     #    #     # ##  #     # #     ##
    // #      ##     ##   #    #      # #   ##   #  #  ###
    //  ###
    /**
     * Gets the tracks from Soundcloud.
     * @returns {Promise<TrackTypes.Track[]>} A promise that returns the tracks.
     */
    static async getTracks() {
        const tracks = [];

        let uri = "https://api.soundcloud.com/users/7641/tracks?limit=200&linked_partitioning=true";

        while (uri) {
            const token = await Soundcloud.getToken();

            const res = await request.get({
                uri,
                headers: {
                    Authorization: `OAuth ${token}`
                },
                json: true
            });

            if (res.statusCode !== 200) {
                throw new Error(`There was an error while getting tracks from Soundcloud: status ${res.statusCode}`);
            }

            if (res.body.collection && res.body.collection.length > 0) {
                tracks.push(...res.body.collection);
                uri = res.body.next_href;
            } else {
                uri = void 0;
            }
        }

        return tracks;
    }

    //               #                      #      ##                                   ###         #
    //              # #                     #     #  #                                   #          #
    // ###    ##    #    ###    ##    ###   ###   #  #   ##    ##    ##    ###    ###    #     ##   # #    ##   ###
    // #  #  # ##  ###   #  #  # ##  ##     #  #  ####  #     #     # ##  ##     ##      #    #  #  ##    # ##  #  #
    // #     ##     #    #     ##      ##   #  #  #  #  #     #     ##      ##     ##    #    #  #  # #   ##    #  #
    // #      ##    #    #      ##   ###    #  #  #  #   ##    ##    ##   ###    ###     #     ##   #  #   ##   #  #
    /**
     * Gets the access token via OAuth from SoundCloud.
     * @returns {Promise} A promise that resolves when the token has been retrieved.
     */
    static async refreshAccessToken() {
        const res = await request.post({
            uri: "https://api.soundcloud.com/oauth2/token",
            form: {
                "grant_type": "refresh_token",
                "client_id": process.env.SOUNDCLOUD_CLIENT_ID,
                "client_secret": process.env.SOUNDCLOUD_CLIENT_SECRET,
                "refresh_token": Soundcloud.refreshToken
            },
            json: true
        });

        if (res.statusCode === 429) {
            throw new Error(`Rate limit reached for Soundcloud ${res.body.errors[0].meta.rate_limit.group}, exceeded ${res.body.errors[0].meta.rate_limit.max_nr_of_requests} requests, limit resets at ${res.body.errors[0].meta.reset_time}`);
        }

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while refreshing an access token from Soundcloud: status ${res.statusCode}`);
        }

        if (!res.body) {
            throw new Error("Soundcloud did not return any data while refreshing an access token.");
        }

        Soundcloud.accessToken = res.body.access_token;
        Soundcloud.refreshToken = res.body.refresh_token;
        Soundcloud.expiration = new Date(new Date().getTime() + 1000 * (res.body.expires_in - 30));
    }
}

module.exports = Soundcloud;
