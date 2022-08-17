//  #####                           #    #
//  #                               #
//  #      # ##    ###    ###    ## #   ##    # ##    ## #
//  ####   ##  #  #   #  #   #  #  ##    #    ##  #  #  #
//  #      #   #  #      #   #  #   #    #    #   #   ##
//  #      #   #  #   #  #   #  #  ##    #    #   #  #
//  #####  #   #   ###    ###    ## #   ###   #   #   ###
//                                                   #   #
//                                                    ###
/**
 * A class of encoding functions.
 */
class Encoding {
    //        #     #           #    #            #          ####                       #
    //        #     #                #            #          #                          #
    //  ###  ###   ###   ###   ##    ###   #  #  ###    ##   ###   ###    ##    ##    ###   ##
    // #  #   #     #    #  #   #    #  #  #  #   #    # ##  #     #  #  #     #  #  #  #  # ##
    // # ##   #     #    #      #    #  #  #  #   #    ##    #     #  #  #     #  #  #  #  ##
    //  # #    ##    ##  #     ###   ###    ###    ##   ##   ####  #  #   ##    ##    ###   ##
    /**
     * Attribute-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static attributeEncode(str) {
        return str && `${str}`.replace(/"/g, "&#34;") || "";
    }

    // #      #          ##    ####                       #
    // #      #           #    #                          #
    // ###   ###   # #    #    ###   ###    ##    ##    ###   ##
    // #  #   #    ####   #    #     #  #  #     #  #  #  #  # ##
    // #  #   #    #  #   #    #     #  #  #     #  #  #  #  ##
    // #  #    ##  #  #  ###   ####  #  #   ##    ##    ###   ##
    /**
     * HTML-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static htmlEncode(str) {
        return str && str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/[\u0080-\u1FFF]/gm, (i) => `&#${i.charCodeAt(0)};`) || "";
    }

    //   #          ####                       #
    //              #                          #
    //   #    ###   ###   ###    ##    ##    ###   ##
    //   #   ##     #     #  #  #     #  #  #  #  # ##
    //   #     ##   #     #  #  #     #  #  #  #  ##
    // # #   ###    ####  #  #   ##    ##    ###   ##
    //  #
    /**
     * Javascript-encodes a string.
     * @param {*} str The string.
     * @returns {string} The encoded string.
     */
    static jsEncode(str) {
        return str && str.replace(/"/gm, "\\\"") || "";
    }

    //        ##                ####                       #
    //         #                #                          #
    //  ###    #    #  #   ###  ###   ###    ##    ##    ###   ##
    // ##      #    #  #  #  #  #     #  #  #     #  #  #  #  # ##
    //   ##    #    #  #   ##   #     #  #  #     #  #  #  #  ##
    // ###    ###    ###  #     ####  #  #   ##    ##    ###   ##
    //                     ###
    /**
     * Slug-encodes a string.
     * @param {*} str The string.
     * @returns {string} The encoded string.
     */
    static slugEncode(str) {
        return str && str.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-/, "").replace(/-$/, "").toLowerCase() || "";
    }
}

if (typeof module === "undefined") {
    window.Encoding = Encoding;
} else {
    module.exports = Encoding; // eslint-disable-line no-undef
}
