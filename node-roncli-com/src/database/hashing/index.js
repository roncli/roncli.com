const crypto = require("crypto"),
    pbkdf2 = require("pbkdf2");

//  #   #                #        #
//  #   #                #
//  #   #   ###    ###   # ##    ##    # ##    ## #
//  #####      #  #      ##  #    #    ##  #  #  #
//  #   #   ####   ###   #   #    #    #   #   ##
//  #   #  #   #      #  #   #    #    #   #  #
//  #   #   ####  ####   #   #   ###   #   #   ###
//                                            #   #
//                                             ###
/**
 * Hashing library.
 */
class Hashing {
    //              #    #  #               #
    //              #    #  #               #
    //  ###   ##   ###   ####   ###   ###   ###
    // #  #  # ##   #    #  #  #  #  ##     #  #
    //  ##   ##     #    #  #  # ##    ##   #  #
    // #      ##     ##  #  #   # #  ###    #  #
    //  ###
    /**
     * Hashes a value.
     * @param {string} value The value to hash.
     * @param {string} salt The salt to use in the hash.
     * @returns {Promise<string>} A promise that returns the hash.
     */
    static async getHash(value, salt) {
        if (salt.length === 36) {
            return crypto.createHash("sha1").update(`${value}-${salt}`, "utf8").digest("hex");
        }

        return (await new Promise((res, rej) => {
            pbkdf2.pbkdf2(value, Buffer.from(salt, "hex"), 12, 32, "sha512", (err, key) => {
                if (err) {
                    rej(err);
                    return;
                }

                res(key);
            });
        })).toString("hex");
    }

    //              #     ##         ##     #
    //              #    #  #         #     #
    //  ###   ##   ###    #     ###   #    ###
    // #  #  # ##   #      #   #  #   #     #
    //  ##   ##     #    #  #  # ##   #     #
    // #      ##     ##   ##    # #  ###     ##
    //  ###
    /**
     * Gets a salt to use for hashing.
     * @returns {string} The salt.
     */
    static getSalt() {
        return crypto.randomBytes(16).toString("hex");
    }

    //              #    ###         #
    //              #     #          #
    //  ###   ##   ###    #     ##   # #    ##   ###
    // #  #  # ##   #     #    #  #  ##    # ##  #  #
    //  ##   ##     #     #    #  #  # #   ##    #  #
    // #      ##     ##   #     ##   #  #   ##   #  #
    //  ###
    /**
     * Gets a token to use for access.
     * @returns {string} The token.
     */
    static getToken() {
        return crypto.randomBytes(crypto.randomInt(64, 128)).toString("hex");
    }
}

module.exports = Hashing;
