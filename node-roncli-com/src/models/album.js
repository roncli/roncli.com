/**
 * @typedef {import("../../types/node/photoTypes").AlbumData} PhotoTypes.AlbumData
 * @typedef {import("../../types/node/photoTypes").PhotoData} PhotoTypes.PhotoData
 */

const PhotoPrism = require("../photoprism");

//    #     ##    #
//   # #     #    #
//  #   #    #    # ##   #   #  ## #
//  #   #    #    ##  #  #   #  # # #
//  #####    #    #   #  #   #  # # #
//  #   #    #    ##  #  #  ##  # # #
//  #   #   ###   # ##    ## #  #   #
/**
 * A class that represents an album.
 */
class Album {
    //              #     ##   ##    #
    //              #    #  #   #    #
    //  ###   ##   ###   #  #   #    ###   #  #  # #
    // #  #  # ##   #    ####   #    #  #  #  #  ####
    //  ##   ##     #    #  #   #    #  #  #  #  #  #
    // #      ##     ##  #  #  ###   ###    ###  #  #
    //  ###
    /**
     * Gets an album by it's UID.
     * @param {string} uid The UID of the album.
     * @returns {Promise<Album>} A promise that returns the album.
     */
    static async getAlbum(uid) {
        const data = await PhotoPrism.getAlbum(uid);

        if (!data) {
            return void 0;
        }

        const album = new Album(data);

        await album.loadPhotos();

        return album;
    }

    //              #     ##   ##    #
    //              #    #  #   #    #
    //  ###   ##   ###   #  #   #    ###   #  #  # #    ###
    // #  #  # ##   #    ####   #    #  #  #  #  ####  ##
    //  ##   ##     #    #  #   #    #  #  #  #  #  #    ##
    // #      ##     ##  #  #  ###   ###    ###  #  #  ###
    //  ###
    /**
     * Gets the list of albums.
     * @returns {Promise<Album[]>} A promise that returns the list of albums.
     */
    static async getAlbums() {
        const data = await PhotoPrism.getAlbums();

        return data.map((album) => new Album(album));
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new album.
     * @param {PhotoTypes.AlbumData} data The album data.
     */
    constructor(data) {
        this.uid = data.UID;
        this.title = data.Title;
        this.description = data.Description;

        /** @type {{url: string, title: string, description: string}[]} */
        this.photos = [];
    }

    // ##                   #  ###   #            #
    //  #                   #  #  #  #            #
    //  #     ##    ###   ###  #  #  ###    ##   ###    ##    ###
    //  #    #  #  #  #  #  #  ###   #  #  #  #   #    #  #  ##
    //  #    #  #  # ##  #  #  #     #  #  #  #   #    #  #    ##
    // ###    ##    # #   ###  #     #  #   ##     ##   ##   ###
    /**
     * Loads the photos for an album.
     * @returns {Promise} A promise that resolves when the photos have been loaded.
     */
    async loadPhotos() {
        const data = await PhotoPrism.getAlbumPhotos(this.uid);

        this.photos = data.map((photo) => ({
            url: `${process.env.PHOTOS_URL}/api/v1/photos/${photo.UID}/dl?t=public`,
            title: photo.Title,
            description: photo.Description
        }));
    }
}

module.exports = Album;
