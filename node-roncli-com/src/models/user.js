/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 * @typedef {import("../../types/node/userTypes").UserData} UserTypes.UserData
 * @typedef {{validated: boolean, data?: object}} ValidationData
 */

const Cache = require("node-redis").Cache,
    ChangeAuthorizationDb = require("../database/changeAuthorization"),
    ChangeEmailTemplate = require("../mail/templates/changeEmail"),
    ChangePasswordTemplate = require("../mail/templates/changePassword"),
    Mail = require("../mail"),
    Role = require("./role"),
    UserDb = require("../database/user"),
    ValidateNewEmailTemplate = require("../mail/templates/validateNewEmail"),
    ValidationTemplate = require("../mail/templates/validation");

//  #   #
//  #   #
//  #   #   ###    ###   # ##
//  #   #  #      #   #  ##  #
//  #   #   ###   #####  #
//  #   #      #  #      #
//   ###   ####    ###   #
/**
 * A class that represents a user.
 */
class User {
    //       #                             ####               #    ##
    //       #                             #                        #
    //  ##   ###    ###  ###    ###   ##   ###   # #    ###  ##     #
    // #     #  #  #  #  #  #  #  #  # ##  #     ####  #  #   #     #
    // #     #  #  # ##  #  #   ##   ##    #     #  #  # ##   #     #
    //  ##   #  #   # #  #  #  #      ##   ####  #  #   # #  ###   ###
    //                          ###
    /**
     * Change's a user's email address.
     * @param {string} id The user ID.
     * @param {string} email The email to change to.
     * @returns {Promise} A promise that resolves when the email has been changed.
     */
    static async changeEmail(id, email) {
        const user = await User.get(id);

        await Promise.all([
            UserDb.changeEmail(user, email),
            ChangeAuthorizationDb.removeByUserAndType(user, "emailChange"),
            ChangeAuthorizationDb.removeByUserAndType(user, "emailValidate")
        ]);
    }

    //       #                 #     ####               #    ##     ##         #  #                                             ####         #            #
    //       #                 #     #                        #    #  #        #  #                                             #                         #
    //  ##   ###    ##    ##   # #   ###   # #    ###  ##     #    #  #  ###   #  #   ###    ##   ###   ###    ###  # #    ##   ###   #  #  ##     ###   ###    ###
    // #     #  #  # ##  #     ##    #     ####  #  #   #     #    #  #  #  #  #  #  ##     # ##  #  #  #  #  #  #  ####  # ##  #      ##    #    ##      #    ##
    // #     #  #  ##    #     # #   #     #  #  # ##   #     #    #  #  #     #  #    ##   ##    #     #  #  # ##  #  #  ##    #      ##    #      ##    #      ##
    //  ##   #  #   ##    ##   #  #  ####  #  #   # #  ###   ###    ##   #      ##   ###     ##   #     #  #   # #  #  #   ##   ####  #  #  ###   ###      ##  ###
    /**
     * Checks whether another user has the email address or username.
     * @param {string} [email] The email address to check.
     * @param {string} [username] The username to check.
     * @param {User} [user] The user wanting to check the email and username.
     * @returns {Promise<{emailExists: boolean, usernameExists: boolean}>} A promise that returns whether the email or username exist already.
     */
    static async checkEmailOrUsernameExists(email, username, user) {
        const promises = [];

        if (email) {
            promises.push((() => UserDb.checkEmailExists(email, user ? user.id : void 0))());
        } else {
            promises.push(false);
        }

        if (username) {
            promises.push((() => UserDb.checkUsernameExists(username, user ? user.id : void 0))());
        } else {
            promises.push(false);
        }

        const data = await Promise.all(promises);

        return {
            emailExists: data[0],
            usernameExists: data[1]
        };
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a user by their ID.
     * @param {string} id The user ID.
     * @returns {Promise<User>} A promise that returns the user.
     */
    static async get(id) {
        const data = await UserDb.get(id);

        if (!data) {
            return void 0;
        }

        return new User(data);
    }

    //              #    ###         ####               #    ##
    //              #    #  #        #                        #
    //  ###   ##   ###   ###   #  #  ###   # #    ###  ##     #
    // #  #  # ##   #    #  #  #  #  #     ####  #  #   #     #
    //  ##   ##     #    #  #   # #  #     #  #  # ##   #     #
    // #      ##     ##  ###     #   ####  #  #   # #  ###   ###
    //  ###                     #
    /**
     * Gets a user by their email address.
     * @param {string} email The email address.
     * @returns {Promise<User>} A promise that returns the user.
     */
    static async getByEmail(email) {
        const data = await UserDb.getByEmail(email);

        if (!data) {
            return void 0;
        }

        return new User(data);
    }

    //              #    ###         #                  #
    //              #    #  #        #
    //  ###   ##   ###   ###   #  #  #      ##    ###  ##    ###
    // #  #  # ##   #    #  #  #  #  #     #  #  #  #   #    #  #
    //  ##   ##     #    #  #   # #  #     #  #   ##    #    #  #
    // #      ##     ##  ###     #   ####   ##   #     ###   #  #
    //  ###                     #                 ###
    /**
     * Gets a user by their email and password.
     * @param {string} email The email address.
     * @param {string} password The password.
     * @returns {Promise<User>} A promise that returns the user.
     */
    static async getByLogin(email, password) {
        const data = await UserDb.getByLogin(email, password, false);

        if (!data || !data.user) {
            return void 0;
        }

        return new User(data.user);
    }

    //              #     ##                                  #
    //              #    #  #                                 #
    //  ###   ##   ###   #     #  #  ###   ###    ##   ###   ###
    // #  #  # ##   #    #     #  #  #  #  #  #  # ##  #  #   #
    //  ##   ##     #    #  #  #  #  #     #     ##    #  #   #
    // #      ##     ##   ##    ###  #     #      ##   #  #    ##
    //  ###
    /**
     * Gets the current user from the request.
     * @param {Express.Request} req The request.
     * @returns {Promise<User>} The user.
     */
    static async getCurrent(req) {
        // Check if the user has logged in this session.
        if (await Cache.exists([`${process.env.REDIS_PREFIX}:session:${req.sessionID}`])) {
            const expire = new Date();
            expire.setDate(expire.getDate() + 1);

            const userData = await Cache.get(`${process.env.REDIS_PREFIX}:session:${req.sessionID}`, expire);

            if (userData) {
                return new User(userData);
            }
        }

        // Check if the user has a saved login.
        const cookie = req.cookies && req.cookies.roncli || void 0;

        if (!cookie) {
            return void 0;
        }

        const userData = await UserDb.getBySavedLogin(cookie.email, cookie.token);

        if (!userData) {
            return void 0;
        }

        // Create login session.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await Cache.add(`${process.env.REDIS_PREFIX}:session:${req.sessionID}`, userData, expire);

        return new User(userData);
    }

    // ##                 #
    //  #
    //  #     ##    ###  ##    ###
    //  #    #  #  #  #   #    #  #
    //  #    #  #   ##    #    #  #
    // ###    ##   #     ###   #  #
    //              ###
    /**
     * Logs in a user by email and password.
     * @param {Express.Request} req The request.
     * @param {string} email The user's email.
     * @param {string} password The password.
     * @param {boolean} saveLogin Whether to save the login.
     * @returns {Promise<{user: User, token: string}>} The user and the saved login token.
     */
    static async login(req, email, password, saveLogin) {
        const data = await UserDb.getByLogin(email, password, saveLogin);

        if (!data || !data.user || saveLogin && !data.token) {
            return void 0;
        }

        if (data.user.dateValidated) {
            const expire = new Date();
            expire.setDate(expire.getDate() + 1);

            await Cache.add(`${process.env.REDIS_PREFIX}:session:${req.sessionID}`, data.user, expire);
        }

        return {
            user: new User(data.user),
            token: data.token
        };
    }

    // ##                             #
    //  #                             #
    //  #     ##    ###   ##   #  #  ###
    //  #    #  #  #  #  #  #  #  #   #
    //  #    #  #   ##   #  #  #  #   #
    // ###    ##   #      ##    ###    ##
    //              ###
    /**
     * Logs out the currently logged in user.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the user has been logged out.
     */
    static async logout(req, res) {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:session:${req.sessionID}`])) {
            res.clearCookie("roncli", {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });

            return;
        }

        const userData = await Cache.get(`${process.env.REDIS_PREFIX}:session:${req.sessionID}`);

        if (!userData) {
            return;
        }

        const user = new User(userData);

        await Cache.remove([`${process.env.REDIS_PREFIX}:session:${req.sessionID}`]);

        const cookie = req.cookies && req.cookies.roncli || void 0;

        if (cookie && cookie.token) {
            if (cookie.token) {
                await UserDb.logoutToken(user.email, cookie.token);
            }

            res.clearCookie("roncli", {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
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
     * @returns {Promise<User>} A promise that returns the new user.
     */
    static async register(email, password, username, dob) {
        const data = await UserDb.register(email, password, username, dob);

        if (!data) {
            return void 0;
        }

        const user = new User(data);

        await user.sendValidationEmail();

        return user;
    }

    //             ##     #       #         #
    //              #             #         #
    // # #    ###   #    ##     ###   ###  ###    ##
    // # #   #  #   #     #    #  #  #  #   #    # ##
    // # #   # ##   #     #    #  #  # ##   #    ##
    //  #     # #  ###   ###    ###   # #    ##   ##
    /**
     * Validates a user by their ID and authorization code.
     * @param {string} userId The user ID.
     * @param {string} code The authorization code.
     * @param {"password" | "emailChange" | "emailValidate" | "register"} type The type of authorization.
     * @returns {Promise<ValidationData>} A promise that returns whether the user is now validated.
     */
    static async validate(userId, code, type) {
        const authorizationData = await ChangeAuthorizationDb.get(userId, code, type);

        if (!authorizationData) {
            return {validated: false};
        }

        const user = await User.get(userId);

        if (!user) {
            return {validated: false};
        }

        if (type === "register" || type === "emailValidate") {
            await ChangeAuthorizationDb.removeByUserAndType(user, type);
            if (type === "emailValidate") {
                await ChangeAuthorizationDb.removeByUserAndType(user, "emailChange");
            }
            return {validated: await UserDb.validate(userId), data: authorizationData.data};
        }

        return {validated: true, data: authorizationData.data};
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new User object.
     * @param {UserTypes.UserData} data The user data.
     */
    constructor(data) {
        this.id = data._id;
        this.email = data.email;
        this.username = data.username;
        this.dateAdded = data.dateAdded;
        this.validated = !!data.dateValidated;
        this.roles = data.roles;
    }

    //                    #     #     #                #  #        ##     #       #         #     #
    //                          #                      #  #         #             #         #
    //  ###  #  #   ###  ##    ###   ##    ###    ###  #  #   ###   #    ##     ###   ###  ###   ##     ##   ###
    // #  #  #  #  #  #   #     #     #    #  #  #  #  #  #  #  #   #     #    #  #  #  #   #     #    #  #  #  #
    // # ##  ####  # ##   #     #     #    #  #   ##    ##   # ##   #     #    #  #  # ##   #     #    #  #  #  #
    //  # #  ####   # #  ###     ##  ###   #  #  #      ##    # #  ###   ###    ###   # #    ##  ###    ##   #  #
    //                                            ###
    /**
     * Whether the site is awaiting the user to validate.
     * @param {"password" | "emailChange" | "emailValidate" | "register"} type The type of validation.
     * @returns {Promise<boolean>} A promise that returns whether the site is awaiting validation.
     */
    awaitingValidation(type) {
        return ChangeAuthorizationDb.existsForUser(this, type);
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
     * @param {string} password The password to change to.
     * @returns {Promise} A promise that resolves when the password has been changed.
     */
    changePassword(password) {
        return Promise.all([
            UserDb.changePassword(this, password),
            ChangeAuthorizationDb.removeByUserAndType(this, "password")
        ]);
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
     * @param {Express.Request} req The request.
     * @param {string} username The user's new username.
     * @returns {Promise} A promise that resolves when the username has been changed.
     */
    async changeUsername(req, username) {
        await UserDb.changeUsername(this, username);

        this.username = username;

        // Update login session.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        const userData = await Cache.get(`${process.env.REDIS_PREFIX}:session:${req.sessionID}`, expire);

        userData.username = username;

        await Cache.add(`${process.env.REDIS_PREFIX}:session:${req.sessionID}`, userData, expire);
    }

    //  #

    // ##     ###
    //  #    ##
    //  #      ##
    // ###   ###
    /**
     * Checks if the user is part of a role.
     * @param {string} role The role to check.
     * @returns {Promise<boolean>} A promise that returns whether the user is part of the specified role.
     */
    async is(role) {
        const data = await Role.getByRole(role);

        if (!data) {
            return false;
        }

        return this.roles.indexOf(data._id) !== -1;
    }

    //                       #   ##   #                             ####               #    ##    ###                                   #
    //                       #  #  #  #                             #                        #    #  #                                  #
    //  ###    ##   ###    ###  #     ###    ###  ###    ###   ##   ###   # #    ###  ##     #    #  #   ##    ###  #  #   ##    ###   ###
    // ##     # ##  #  #  #  #  #     #  #  #  #  #  #  #  #  # ##  #     ####  #  #   #     #    ###   # ##  #  #  #  #  # ##  ##      #
    //   ##   ##    #  #  #  #  #  #  #  #  # ##  #  #   ##   ##    #     #  #  # ##   #     #    # #   ##    #  #  #  #  ##      ##    #
    // ###     ##   #  #   ###   ##   #  #   # #  #  #  #      ##   ####  #  #   # #  ###   ###   #  #   ##    ###   ###   ##   ###      ##
    //                                                   ###                                                     #
    /**
     * Sends a change email request to the user.
     * @returns {Promise<boolean>} A promise that returns whether the email was sent.
     */
    async sendChangeEmailRequest() {
        // Check if it's too soon to send an email change request.
        if (await ChangeAuthorizationDb.existsForUser(this, "emailChange")) {
            return false;
        }

        // Create new email change request.
        const request = await ChangeAuthorizationDb.create(this, "emailChange");

        // Send email change request.
        await Mail.send({
            to: {address: this.email, name: this.username},
            subject: "Change your email address",
            html: ChangeEmailTemplate.html({email: this.email, reason: "a request was made to change the email address of your account", authorizationCode: request.authorizationCode, changeAuthorization: request.changeAuthorization, user: this}),
            text: ChangeEmailTemplate.text({email: this.email, reason: "a request was made to change the email address of your account", authorizationCode: request.authorizationCode, changeAuthorization: request.changeAuthorization, user: this})
        });

        return true;
    }

    //                       #   ##   #                             ####               #    ##    #  #        ##     #       #         #     #
    //                       #  #  #  #                             #                        #    #  #         #             #         #
    //  ###    ##   ###    ###  #     ###    ###  ###    ###   ##   ###   # #    ###  ##     #    #  #   ###   #    ##     ###   ###  ###   ##     ##   ###
    // ##     # ##  #  #  #  #  #     #  #  #  #  #  #  #  #  # ##  #     ####  #  #   #     #    #  #  #  #   #     #    #  #  #  #   #     #    #  #  #  #
    //   ##   ##    #  #  #  #  #  #  #  #  # ##  #  #   ##   ##    #     #  #  # ##   #     #     ##   # ##   #     #    #  #  # ##   #     #    #  #  #  #
    // ###     ##   #  #   ###   ##   #  #   # #  #  #  #      ##   ####  #  #   # #  ###   ###    ##    # #  ###   ###    ###   # #    ##  ###    ##   #  #
    //                                                   ###
    /**
     * Sends a change email validation to the user.
     * @param {string} email The email address to change to.
     * @returns {Promise<boolean>} A promise that returns whether the email was sent.
     */
    async sendChangeEmailValidation(email) {
        // Check if it's too soon to send an email validation request.
        if (await ChangeAuthorizationDb.existsForUser(this, "emailValidate")) {
            return false;
        }

        // Create new email validation request.
        const request = await ChangeAuthorizationDb.create(this, "emailValidate", {email});

        // Send email validation request.
        await Mail.send({
            to: {address: email, name: this.username},
            subject: "Validate your new email address",
            html: ValidateNewEmailTemplate.html({email, reason: "a request was made to change the email address of your account", authorizationCode: request.authorizationCode, changeAuthorization: request.changeAuthorization, user: this}),
            text: ValidateNewEmailTemplate.text({email, reason: "a request was made to change the email address of your account", authorizationCode: request.authorizationCode, changeAuthorization: request.changeAuthorization, user: this})
        });

        return true;
    }

    //                       #   ##   #                             ###                                            #  ####               #    ##
    //                       #  #  #  #                             #  #                                           #  #                        #
    //  ###    ##   ###    ###  #     ###    ###  ###    ###   ##   #  #   ###   ###    ###   #  #   ##   ###    ###  ###   # #    ###  ##     #
    // ##     # ##  #  #  #  #  #     #  #  #  #  #  #  #  #  # ##  ###   #  #  ##     ##     #  #  #  #  #  #  #  #  #     ####  #  #   #     #
    //   ##   ##    #  #  #  #  #  #  #  #  # ##  #  #   ##   ##    #     # ##    ##     ##   ####  #  #  #     #  #  #     #  #  # ##   #     #
    // ###     ##   #  #   ###   ##   #  #   # #  #  #  #      ##   #      # #  ###    ###    ####   ##   #      ###  ####  #  #   # #  ###   ###
    //                                                   ###
    /**
     * Sends a change password email to the user.
     * @param {string} reason The reason to include with the mail.
     * @returns {Promise<boolean>} A promise that returns whether the email was sent.
     */
    async sendChangePasswordEmail(reason) {
        // Check if it's too soon to send a change password request.
        if (await ChangeAuthorizationDb.existsForUser(this, "password")) {
            return false;
        }

        // Create new change password request.
        const request = await ChangeAuthorizationDb.create(this, "password");

        // Send change password request.
        await Mail.send({
            to: {address: this.email, name: this.username},
            subject: "Change your password",
            html: ChangePasswordTemplate.html({email: this.email, reason, authorizationCode: request.authorizationCode, changeAuthorization: request.changeAuthorization, user: this}),
            text: ChangePasswordTemplate.text({email: this.email, reason, authorizationCode: request.authorizationCode, changeAuthorization: request.changeAuthorization, user: this})
        });

        return true;
    }

    //                       #  #  #        ##     #       #         #     #                ####               #    ##
    //                       #  #  #         #             #         #                      #                        #
    //  ###    ##   ###    ###  #  #   ###   #    ##     ###   ###  ###   ##     ##   ###   ###   # #    ###  ##     #
    // ##     # ##  #  #  #  #  #  #  #  #   #     #    #  #  #  #   #     #    #  #  #  #  #     ####  #  #   #     #
    //   ##   ##    #  #  #  #   ##   # ##   #     #    #  #  # ##   #     #    #  #  #  #  #     #  #  # ##   #     #
    // ###     ##   #  #   ###   ##    # #  ###   ###    ###   # #    ##  ###    ##   #  #  ####  #  #   # #  ###   ###
    /**
     * Sends a validation email to the user.
     * @returns {Promise<boolean>} A promise that returns whether the email was sent.
     */
    async sendValidationEmail() {
        // Check if it's too soon to send a validation request.
        if (await ChangeAuthorizationDb.existsForUser(this, "register")) {
            return false;
        }

        // Create new validation request.
        const request = await ChangeAuthorizationDb.create(this, "register");

        // Send validation request.
        await Mail.send({
            to: {address: this.email, name: this.username},
            subject: "Please validate your registration",
            html: ValidationTemplate.html({email: this.email, reason: "this email address was registered on the site", user: this, code: request.authorizationCode}),
            text: ValidationTemplate.text({email: this.email, reason: "this email address was registered on the site", user: this, code: request.authorizationCode})
        });

        return true;
    }
}

module.exports = User;
