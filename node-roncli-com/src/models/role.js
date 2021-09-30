/**
 * @typedef {import("../../types/node/roleTypes").RoleData} RoleTypes.RoleData
 */

const Cache = require("node-redis").Cache,
    RoleDb = require("../database/role");

//  ####           ##
//  #   #           #
//  #   #   ###     #     ###
//  ####   #   #    #    #   #
//  # #    #   #    #    #####
//  #  #   #   #    #    #
//  #   #   ###    ###    ###
/**
 * A class that represents a role.
 */
class Role {
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
     * @returns {Promise<Role>} The role.
     */
    static async getByRole(role) {
        const key = `${process.env.REDIS_PREFIX}:roles:${role}`;

        let data;

        if (await Cache.exists([key])) {
            data = await Cache.get(key);
        } else {
            data = await RoleDb.getByRole(role);

            if (data) {
                await Cache.add(key, data, new Date(new Date().getTime() + 30 * 86400 * 1000));
            }
        }

        return data ? new Role(data) : void 0;
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new role object.
     * @param {RoleTypes.RoleData} data The role data.
     */
    constructor(data) {
        this._id = data._id;
        this.role = data.role;
        this.dateAdded = data.dateAdded;
    }
}

module.exports = Role;
