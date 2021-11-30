/**
 * @typedef {import("../../types/node/resumeTypes").ResumeData} ResumeTypes.ResumeData
 */

const ResumeDb = require("../database/resume");

//  ####
//  #   #
//  #   #   ###    ###   #   #  ## #    ###
//  ####   #   #  #      #   #  # # #  #   #
//  # #    #####   ###   #   #  # # #  #####
//  #  #   #          #  #  ##  # # #  #
//  #   #   ###   ####    ## #  #   #   ###
/**
 * A class that represents a résumé.
 */
class Resume {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the résumé.
     * @returns {Promise<Resume>} A promise that returns the résumé.
     */
    static async get() {
        const data = await ResumeDb.get();

        return data ? new Resume(data) : void 0;
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new résumé object.
     * @param {ResumeTypes.ResumeData} data The résumé data.
     */
    constructor(data) {
        this.id = data._id;
        this.resume = data.resume;
    }

    //  ###    ###  # #    ##
    // ##     #  #  # #   # ##
    //   ##   # ##  # #   ##
    // ###     # #   #     ##
    /**
     * Saves the résumé.
     * @returns {Promise} A promise that resolves when the résumé is saved.
     */
    async save() {
        await ResumeDb.save(this);
    }
}

module.exports = Resume;
