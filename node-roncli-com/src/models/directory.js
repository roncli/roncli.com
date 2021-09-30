const fs = require("fs").promises,
    path = require("path");

//  ####     #                          #
//   #  #                               #
//   #  #   ##    # ##    ###    ###   ####    ###   # ##   #   #
//   #  #    #    ##  #  #   #  #   #   #     #   #  ##  #  #   #
//   #  #    #    #      #####  #       #     #   #  #      #  ##
//   #  #    #    #      #      #   #   #  #  #   #  #       ## #
//  ####    ###   #       ###    ###     ##    ###   #          #
//                                                          #   #
//                                                           ###
/**
 * A class that represents a directory on disk.
 */
class Directory {
    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new Directory object.
     * @param {string} dirPath The path of the directory.
     */
    constructor(dirPath) {
        this.path = dirPath;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the contents of the directory.
     * @returns {Promise<{name: string, size: number, date: Date}[]>} A promise that returns the contents of the directory.
     */
    async get() {
        /** @type {{name: string, size: number, date: Date}[]} */
        const entries = [];

        const dir = await fs.opendir(this.path);
        for await (const entry of dir) {
            /** @type {number} */
            let size = void 0;

            /** @type {Date} */
            let date = void 0;

            if (entry.isFile()) {
                const file = await fs.stat(path.join(this.path, entry.name));
                size = file.size;
                date = file.mtime;
            }
            entries.push({name: entry.name, size, date});
        }

        entries.sort((a, b) => {
            if (a.size === void 0 && b.size !== void 0) {
                return -1;
            }

            if (a.size !== void 0 && b.size === void 0) {
                return 1;
            }

            return a.name.localeCompare(b.name);
        });

        return entries;
    }
}

module.exports = Directory;
