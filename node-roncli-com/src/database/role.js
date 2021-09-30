/**
 * @typedef {import("../../types/node/roleTypes").RoleData} RoleTypes.RoleData
 * @typedef {import("../../types/node/roleTypes").RoleMongoData} RoleTypes.RoleMongoData
 */

const Db = require(".");

//  ####           ##           ####   #
//  #   #           #            #  #  #
//  #   #   ###     #     ###    #  #  # ##
//  ####   #   #    #    #   #   #  #  ##  #
//  # #    #   #    #    #####   #  #  #   #
//  #  #   #   #    #    #       #  #  ##  #
//  #   #   ###    ###    ###   ####   # ##
/**
 * A class to handle database calls to the role collection.
 */
class RoleDb {
    //              #    ###         ###         ##
    //              #    #  #        #  #         #
    //  ###   ##   ###   ###   #  #  #  #   ##    #     ##
    // #  #  # ##   #    #  #  #  #  ###   #  #   #    # ##
    //  ##   ##     #    #  #   # #  # #   #  #   #    ##
    // #      ##     ##  ###     #   #  #   ##   ###    ##
    //  ###                     #
    /**
     * Gets a role by its role name.
     * @param {string} role The role name.
     * @returns {Promise<RoleTypes.RoleData>} A promise that returns the role data.
     */
    static async getByRole(role) {
        const db = await Db.get();

        const data = await db.collection("role").findOne({role});

        return data ? {
            _id: data._id.toHexString(),
            role: data.role,
            dateAdded: data.dateAdded
        } : void 0;
    }
}

module.exports = RoleDb;
