//  #   #                #
//  #   #                #
//  ##  #  #   #  ## #   # ##    ###   # ##    ###
//  # # #  #   #  # # #  ##  #  #   #  ##  #  #
//  #  ##  #   #  # # #  #   #  #####  #       ###
//  #   #  #  ##  # # #  ##  #  #      #          #
//  #   #   ## #  #   #  # ##    ###   #      ####
/**
 * A class of number functions.
 */
class Numbers {
    //   #    #    ##           ##    #
    //  # #         #          #  #
    //  #    ##     #     ##    #    ##    ####   ##
    // ###    #     #    # ##    #    #      #   # ##
    //  #     #     #    ##    #  #   #     #    ##
    //  #    ###   ###    ##    ##   ###   ####   ##
    /**
     * Gets the file size from the number of bytes.
     * @param {*} size The number of bites.
     * @returns {string} The text of the file size.
     */
    static fileSize(size) {
        if (size <= 0) {
            return "0 bytes";
        }
        if (size === 1) {
            return "1 byte";
        }
        if (size < 1000) {
            return `${size} bytes`;
        }

        if (size < 1024 * 10) {
            return `${(Math.floor(size / 10.24) / 100).toFixed(2)} KB`;
        }
        if (size < 1024 * 100) {
            return `${(Math.floor(size / 102.4) / 10).toFixed(1)} KB`;
        }
        if (size < 1024 * 1000) {
            return `${Math.floor(size / 1024).toFixed(0)} KB`;
        }

        if (size < 1024 ** 2 * 10) {
            return `${(Math.floor(size / (1024 * 10.24)) / 100).toFixed(2)} MB`;
        }
        if (size < 1024 ** 2 * 100) {
            return `${(Math.floor(size / (1024 * 102.4)) / 10).toFixed(1)} MB`;
        }
        if (size < 1024 ** 2 * 1000) {
            return `${Math.floor(size / (1024 * 1024)).toFixed(0)} MB`;
        }

        if (size < 1024 ** 3 * 10) {
            return `${(Math.floor(size / (1024 ** 2 * 10.24)) / 100).toFixed(2)} GB`;
        }
        if (size < 1024 ** 3 * 100) {
            return `${(Math.floor(size / (1024 ** 2 * 102.4)) / 10).toFixed(1)} GB`;
        }
        if (size < 1024 ** 3 * 1000) {
            return `${Math.floor(size / (1024 ** 2 * 1024)).toFixed(0)} GB`;
        }

        if (size < 1024 ** 4 * 10) {
            return `${(Math.floor(size / (1024 ** 3 * 10.24)) / 100).toFixed(2)} TB`;
        }
        if (size < 1024 ** 4 * 100) {
            return `${(Math.floor(size / (1024 ** 3 * 102.4)) / 10).toFixed(1)} TB`;
        }
        return `${Math.floor(size / (1024 ** 3 * 1024)).toFixed(0)} TB`;
    }
}

if (typeof module === "undefined") {
    window.Numbers = Numbers;
} else {
    module.exports = Numbers; // eslint-disable-line no-undef
}
