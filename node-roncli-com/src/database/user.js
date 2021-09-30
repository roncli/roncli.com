/**
 * @typedef {import("../models/user")} User
 * @typedef {import("../../types/node/userTypes").SavedLoginMongoData} UserTypes.SavedLoginMongoData
 * @typedef {import("../../types/node/userTypes").UserData} UserTypes.UserData
 * @typedef {import("../../types/node/userTypes").UserMongoData} UserTypes.UserMongoData
 */

const Db = require("."),
    Hashing = require("./hashing"),
    MongoDb = require("mongodb");

//  #   #                       ####   #
//  #   #                        #  #  #
//  #   #   ###    ###   # ##    #  #  # ##
//  #   #  #      #   #  ##  #   #  #  ##  #
//  #   #   ###   #####  #       #  #  #   #
//  #   #      #  #      #       #  #  ##  #
//   ###   ####    ###   #      ####   # ##
/**
 * A class to handle database calls to the user collection.
 */
class UserDb {
    //       #                             ####               #    ##
    //       #                             #                        #
    //  ##   ###    ###  ###    ###   ##   ###   # #    ###  ##     #
    // #     #  #  #  #  #  #  #  #  # ##  #     ####  #  #   #     #
    // #     #  #  # ##  #  #   ##   ##    #     #  #  # ##   #     #
    //  ##   #  #   # #  #  #  #      ##   ####  #  #   # #  ###   ###
    //                          ###
    /**
     * Changes a user's email.
     * @param {User} user The user.
     * @param {string} email The new email.
     * @returns {Promise} A promise that resolves when the email has been changed.
     */
    static async changeEmail(user, email) {
        const db = await Db.get();

        return db.collection("user").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(user.id)}, {$set: {email}});
    }

    //       #                             ###                                            #
    //       #                             #  #                                           #
    //  ##   ###    ###  ###    ###   ##   #  #   ###   ###    ###   #  #   ##   ###    ###
    // #     #  #  #  #  #  #  #  #  # ##  ###   #  #  ##     ##     #  #  #  #  #  #  #  #
    // #     #  #  # ##  #  #   ##   ##    #     # ##    ##     ##   ####  #  #  #     #  #
    //  ##   #  #   # #  #  #  #      ##   #      # #  ###    ###    ####   ##   #      ###
    //                          ###
    /**
     * Changes a user's password.
     * @param {User} user The user.
     * @param {string} password The new password.
     * @returns {Promise} A promise that resolves when the password has been changed.
     */
    static async changePassword(user, password) {
        const db = await Db.get(),
            salt = Hashing.getSalt(),
            hash = await Hashing.getHash(password, salt);

        return db.collection("user").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(user.id)}, {$set: {password: {salt, hash}}});
    }

    //       #                             #  #
    //       #                             #  #
    //  ##   ###    ###  ###    ###   ##   #  #   ###    ##   ###   ###    ###  # #    ##
    // #     #  #  #  #  #  #  #  #  # ##  #  #  ##     # ##  #  #  #  #  #  #  ####  # ##
    // #     #  #  # ##  #  #   ##   ##    #  #    ##   ##    #     #  #  # ##  #  #  ##
    //  ##   #  #   # #  #  #  #      ##    ##   ###     ##   #     #  #   # #  #  #   ##
    //                          ###
    /**
     * Changes a user's username.
     * @param {User} user The user.
     * @param {string} username The new username.
     * @returns {Promise} A promise that resolves when the username has been changed.
     */
    static async changeUsername(user, username) {
        const db = await Db.get();

        return db.collection("user").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(user.id)}, {$set: {username}});
    }

    //       #                 #     ####               #    ##    ####         #            #
    //       #                 #     #                        #    #                         #
    //  ##   ###    ##    ##   # #   ###   # #    ###  ##     #    ###   #  #  ##     ###   ###    ###
    // #     #  #  # ##  #     ##    #     ####  #  #   #     #    #      ##    #    ##      #    ##
    // #     #  #  ##    #     # #   #     #  #  # ##   #     #    #      ##    #      ##    #      ##
    //  ##   #  #   ##    ##   #  #  ####  #  #   # #  ###   ###   ####  #  #  ###   ###      ##  ###
    /**
     * Checks whether an email exists for users other than the specified user ID.
     * @param {string} email The email to check.
     * @param {string} [userId] The ID of the user checking for the email.
     * @returns {Promise<boolean>} A promise that returns whether the email exists.
     */
    static async checkEmailExists(email, userId) {
        const db = await Db.get(),
            params = {email};

        if (userId) {
            params._id = {$ne: MongoDb.ObjectId.createFromHexString(userId)};
        }

        const user = await db.collection("user").findOne(params);

        return !!user;
    }

    //       #                 #     #  #                                             ####         #            #
    //       #                 #     #  #                                             #                         #
    //  ##   ###    ##    ##   # #   #  #   ###    ##   ###   ###    ###  # #    ##   ###   #  #  ##     ###   ###    ###
    // #     #  #  # ##  #     ##    #  #  ##     # ##  #  #  #  #  #  #  ####  # ##  #      ##    #    ##      #    ##
    // #     #  #  ##    #     # #   #  #    ##   ##    #     #  #  # ##  #  #  ##    #      ##    #      ##    #      ##
    //  ##   #  #   ##    ##   #  #   ##   ###     ##   #     #  #   # #  #  #   ##   ####  #  #  ###   ###      ##  ###
    /**
     * Checks whether an username exists for users other than the specified user ID.
     * @param {string} username The username to check.
     * @param {string} [userId] The ID of the user checking for the username.
     * @returns {Promise<boolean>} A promise that returns whether the username exists.
     */
    static async checkUsernameExists(username, userId) {
        const db = await Db.get(),
            params = {username};

        if (userId) {
            params._id = {$ne: MongoDb.ObjectId.createFromHexString(userId)};
        }

        const user = await db.collection("user").findOne(params);

        return !!user;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a user's account by their user ID.
     * @param {string} id The user ID.
     * @returns {Promise<UserTypes.UserData>} A promise that returns the user data.
     */
    static async get(id) {
        const db = await Db.get();

        const user = await db.collection("user").findOne({_id: MongoDb.ObjectId.createFromHexString(id)});

        if (!user) {
            return void 0;
        }

        return {
            _id: user._id.toHexString(),
            email: user.email,
            dob: user.dob,
            username: user.username,
            password: user.password,
            dateValidated: user.dateValidated,
            dateAdded: user.dateAdded,
            roles: user.roles.map((r) => r.toHexString())
        };
    }

    //              #    ###         ####               #    ##
    //              #    #  #        #                        #
    //  ###   ##   ###   ###   #  #  ###   # #    ###  ##     #
    // #  #  # ##   #    #  #  #  #  #     ####  #  #   #     #
    //  ##   ##     #    #  #   # #  #     #  #  # ##   #     #
    // #      ##     ##  ###     #   ####  #  #   # #  ###   ###
    //  ###                     #
    /**
     * Gets a user's account by their email address.
     * @param {string} email The user's email address.
     * @returns {Promise<UserTypes.UserData>} A promise that returns the user data.
     */
    static async getByEmail(email) {
        const db = await Db.get();

        const user = await db.collection("user").findOne({email});

        if (!user) {
            return void 0;
        }

        return {
            _id: user._id.toHexString(),
            email: user.email,
            dob: user.dob,
            username: user.username,
            password: user.password,
            dateValidated: user.dateValidated,
            dateAdded: user.dateAdded,
            roles: user.roles.map((r) => r.toHexString())
        };
    }

    //              #    ###         #                  #
    //              #    #  #        #
    //  ###   ##   ###   ###   #  #  #      ##    ###  ##    ###
    // #  #  # ##   #    #  #  #  #  #     #  #  #  #   #    #  #
    //  ##   ##     #    #  #   # #  #     #  #   ##    #    #  #
    // #      ##     ##  ###     #   ####   ##   #     ###   #  #
    //  ###                     #                 ###
    /**
     * Gets a user by their login credentials.
     * @param {string} email The user's email address.
     * @param {string} password The password.
     * @param {boolean} saveLogin Whether to save the login and return a token.
     * @returns {Promise<{user: UserTypes.UserData, token: string}>} The user, and optionally, a token.
     */
    static async getByLogin(email, password, saveLogin) {
        const db = await Db.get();

        const user = await db.collection("user").findOne({email});

        if (!user || user.password.hash.toLowerCase() !== await Hashing.getHash(password, user.password.salt)) {
            return void 0;
        }

        // Rehash old passwords with the new algorithm.
        if (user.password.salt.length === 36) {
            user.password.salt = Hashing.getSalt();
            user.password.hash = await Hashing.getHash(password, user.password.salt);

            await db.collection("user").findOneAndUpdate({_id: user._id}, {$set: {password: user.password}});
        }

        /** @type {string} */
        let token = void 0;

        if (saveLogin && !!user.dateValidated) {
            const salt = Hashing.getSalt();

            token = Hashing.getToken();

            await db.collection("savedLogin").insertOne({
                userId: user._id,
                token: {
                    salt,
                    hash: await Hashing.getHash(token, salt)
                },
                dateAdded: new Date()
            });
        }

        return {
            user: {
                _id: user._id.toHexString(),
                email: user.email,
                dob: user.dob,
                username: user.username,
                password: user.password,
                dateValidated: user.dateValidated,
                dateAdded: user.dateAdded,
                roles: user.roles.map((r) => r.toHexString())
            },
            token
        };
    }

    //              #    ###          ##                        #  #                  #
    //              #    #  #        #  #                       #  #
    //  ###   ##   ###   ###   #  #   #     ###  # #    ##    ###  #      ##    ###  ##    ###
    // #  #  # ##   #    #  #  #  #    #   #  #  # #   # ##  #  #  #     #  #  #  #   #    #  #
    //  ##   ##     #    #  #   # #  #  #  # ##  # #   ##    #  #  #     #  #   ##    #    #  #
    // #      ##     ##  ###     #    ##    # #   #     ##    ###  ####   ##   #     ###   #  #
    //  ###                     #                                               ###
    /**
     * Gets a user by their saved login.
     * @param {string} email The user's email address.
     * @param {string} token The user's token.
     * @returns {Promise<UserTypes.UserData>} A promise that returns the user.
     */
    static async getBySavedLogin(email, token) {
        const db = await Db.get();

        const user = await db.collection("user").findOne({email});

        if (!user) {
            return void 0;
        }

        const savedLogin = await db.collection("savedLogin").find({userId: user._id}).toArray();

        for (const login of savedLogin) {
            if (login.token.hash === await Hashing.getHash(token, login.token.salt)) {
                return {
                    _id: user._id.toHexString(),
                    email: user.email,
                    dob: user.dob,
                    username: user.username,
                    password: user.password,
                    dateValidated: user.dateValidated,
                    dateAdded: user.dateAdded,
                    roles: user.roles.map((r) => r.toHexString())
                };
            }
        }

        return void 0;
    }

    // ##                             #    ###         #
    //  #                             #     #          #
    //  #     ##    ###   ##   #  #  ###    #     ##   # #    ##   ###
    //  #    #  #  #  #  #  #  #  #   #     #    #  #  ##    # ##  #  #
    //  #    #  #   ##   #  #  #  #   #     #    #  #  # #   ##    #  #
    // ###    ##   #      ##    ###    ##   #     ##   #  #   ##   #  #
    //              ###
    /**
     * Removes a user's token from the saved logins.
     * @param {string} email The user's email address.
     * @param {string} token The token.
     * @returns {Promise} A promise that resolves when the token has been removed.
     */
    static async logoutToken(email, token) {
        const db = await Db.get();

        const user = await db.collection("user").findOne({email});

        if (!user) {
            return;
        }

        const savedLogin = await db.collection("savedLogin").find({userId: user._id}).toArray();

        for (const login of savedLogin) {
            if (login.token.hash === await Hashing.getHash(token, login.token.salt)) {
                await db.collection("savedLogin").deleteOne({_id: login._id});
                return;
            }
        }
    }

    //                    #            #
    //                                 #
    // ###    ##    ###  ##     ###   ###    ##   ###
    // #  #  # ##  #  #   #    ##      #    # ##  #  #
    // #     ##     ##    #      ##    #    ##    #
    // #      ##   #     ###   ###      ##   ##   #
    //              ###
    /**
     * Registers a user.
     * @param {string} email The email address.
     * @param {string} password The password.
     * @param {string} username The username.
     * @param {Date} dob The date of birth.
     * @returns {Promise<UserTypes.UserData>} A promise that returns the new user data.
     */
    static async register(email, password, username, dob) {
        const db = await Db.get(),
            salt = Hashing.getSalt(),
            hash = await Hashing.getHash(password, salt);

        const data = {
            email,
            dob,
            username,
            password: {salt, hash},
            roles: [],
            dateAdded: new Date()
        };

        const result = await db.collection("user").insertOne(data);

        if (!result.acknowledged) {
            return void 0;
        }

        data._id = result.insertedId.toHexString();

        return data;
    }

    //             ##     #       #         #
    //              #             #         #
    // # #    ###   #    ##     ###   ###  ###    ##
    // # #   #  #   #     #    #  #  #  #   #    # ##
    // # #   # ##   #     #    #  #  # ##   #    ##
    //  #     # #  ###   ###    ###   # #    ##   ##
    /**
     * Marks a user as validated.
     * @param {string} userId The user ID.
     * @returns {Promise<boolean>} A promise that returns whether the user was validated.
     */
    static async validate(userId) {
        const db = await Db.get();

        const data = await db.collection("user").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(userId)}, {$set: {dateValidated: new Date()}}, {returnDocument: "after"});

        return data && data.value && !!data.value.dateValidated;
    }
}

module.exports = UserDb;
