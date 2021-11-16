/**
 * @typedef {import("../../types/node/photoTypes").AlbumData} PhotoTypes.AlbumData
 * @typedef {import("../../types/node/photoTypes").PhotoData} PhotoTypes.PhotoData
 */

const request = require("@root/request");

//  ####   #              #            ####            #
//  #   #  #              #            #   #
//  #   #  # ##    ###   ####    ###   #   #  # ##    ##     ###   ## #
//  ####   ##  #  #   #   #     #   #  ####   ##  #    #    #      # # #
//  #      #   #  #   #   #     #   #  #      #        #     ###   # # #
//  #      #   #  #   #   #  #  #   #  #      #        #        #  # # #
//  #      #   #   ###     ##    ###   #      #       ###   ####   #   #
/**
 * A class that handles calls to PhotoPrism's API.
 */
class PhotoPrism {
    //              #     ##   ##    #
    //              #    #  #   #    #
    //  ###   ##   ###   #  #   #    ###   #  #  # #
    // #  #  # ##   #    ####   #    #  #  #  #  ####
    //  ##   ##     #    #  #   #    #  #  #  #  #  #
    // #      ##     ##  #  #  ###   ###    ###  #  #
    //  ###
    /**
     * Gets an album from PhotoPrism.
     * @param {string} uid The album's UID.
     * @return {Promise<PhotoTypes.AlbumData>}> A promise that returns the album.
     */
    static async getAlbum(uid) {
        const res = await request.get({
            uri: `http://photoprism:2342/api/v1/albums/${uid}`,
            json: true
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting an album from PhotoPrism: status ${res.statusCode}`);
        }

        if (!res.body) {
            return void 0;
        }

        return res.body;
    }

    //              #     ##   ##    #                 ###   #            #
    //              #    #  #   #    #                 #  #  #            #
    //  ###   ##   ###   #  #   #    ###   #  #  # #   #  #  ###    ##   ###    ##    ###
    // #  #  # ##   #    ####   #    #  #  #  #  ####  ###   #  #  #  #   #    #  #  ##
    //  ##   ##     #    #  #   #    #  #  #  #  #  #  #     #  #  #  #   #    #  #    ##
    // #      ##     ##  #  #  ###   ###    ###  #  #  #     #  #   ##     ##   ##   ###
    //  ###
    /**
     * Gets an album's photos from PhotoPrism.
     * @param {string} uid The album's UID.
     * @return {Promise<PhotoTypes.PhotoData[]>} A promise that returns the photos.
     */
    static async getAlbumPhotos(uid) {
        const res = await request.get({
            uri: `http://photoprism:2342/api/v1/photos?album=${uid}&count=999999999&offset=0`,
            json: true
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting album photos from PhotoPrism: status ${res.statusCode}`);
        }

        if (!res.body || !res.body.length) {
            return [];
        }

        return res.body;
    }

    //              #     ##   ##    #
    //              #    #  #   #    #
    //  ###   ##   ###   #  #   #    ###   #  #  # #    ###
    // #  #  # ##   #    ####   #    #  #  #  #  ####  ##
    //  ##   ##     #    #  #   #    #  #  #  #  #  #    ##
    // #      ##     ##  #  #  ###   ###    ###  #  #  ###
    //  ###
    /**
     * Gets the list of albums from PhotoPrism.
     * @returns {Promise<PhotoTypes.AlbumData[]>} A promise that returns the list of albums.
     */
    static async getAlbums() {
        const res = await request.get({
            uri: "http://photoprism:2342/api/v1/albums?type=album&count=999999999",
            json: true
        });

        if (res.statusCode !== 200) {
            throw new Error(`There was an error while getting albums from PhotoPrism: status ${res.statusCode}`);
        }

        if (!res.body || !res.body.length) {
            return [];
        }

        return res.body;
    }
}

module.exports = PhotoPrism;
