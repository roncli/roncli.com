/**
 * @typedef {import("../models/resume")} Resume
 * @typedef {import("../../types/node/resumeTypes").ResumeData} ResumeTypes.ResumeData
 * @typedef {import("../../types/node/resumeTypes").ResumeMongoData} ResumeTypes.ResumeMongoData
 */

const Db = require("."),
    MongoDb = require("mongodb");

//  ####                                      ####   #
//  #   #                                      #  #  #
//  #   #   ###    ###   #   #  ## #    ###    #  #  # ##
//  ####   #   #  #      #   #  # # #  #   #   #  #  ##  #
//  # #    #####   ###   #   #  # # #  #####   #  #  #   #
//  #  #   #          #  #  ##  # # #  #       #  #  ##  #
//  #   #   ###   ####    ## #  #   #   ###   ####   # ##
/**
 * A class to handle database calls to the résumé collection.
 */
class ResumeDb {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the résumé from the database.
     * @returns {Promise<ResumeTypes.ResumeData>} A promise that returns the résumé.
     */
    static async get() {
        const db = await Db.get();

        const resume = await db.collection("resume").findOne({});

        return resume ? {
            _id: resume._id.toHexString(),
            resume: resume.resume
        } : void 0;
    }

    //  ###    ###  # #    ##
    // ##     #  #  # #   # ##
    //   ##   # ##  # #   ##
    // ###     # #   #     ##
    /**
     * Saves the résumé to the database.
     * @param {Resume} resume The résumé to save.
     * @returns {Promise} A promise that resolves when the résumé has been saved.
     */
    static async save(resume) {
        const db = await Db.get();

        await db.collection("resume").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(resume.id)}, {$set: {resume: resume.resume}});
    }

}

module.exports = ResumeDb;
