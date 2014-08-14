var moment = require("moment"),
    db = require("../database/database.js"),
    crypto = require("crypto"),
    _ = require("underscore"),
    captcha = require("./captcha"),
    mail = require("../mail/mail"),
    template = require("../templates/template.js"),
    guid = require("../guid/guid"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    getHashedPassword = function(password, salt, callback) {
        "use strict";

        var sha1 = crypto.createHash("sha1");
        sha1.write(password + "-" + salt, "utf8", function() {
            sha1.end();
            callback(sha1.read().toString("hex").toUpperCase());
        });
    };

module.exports.isDobValid = function(dob, callback) {
    "use strict";

    var date = moment(new Date(dob));

    if (date === false) {
        callback({
            error: "Invalid date of birth.",
            status: 400
        });
        return;
    }

    callback(null, moment().diff(date, "years", true) >= 13);
};

/**
 * Determines whether the alias already exists.
 * @param {string} alias The alias to check.
 * @param {number} userId The user ID to exclude from the check.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.aliasExists = function(alias, userId, callback) {
    "use strict";

    db.query(
        "SELECT UserID FROM tblUser WHERE Alias = @alias and UserID <> @userId",
        {
            alias: {type: db.VARCHAR(50), value: alias},
            userId: {type: db.INT, value: userId}
        },
        function(err, data) {
            if (err) {
                console.log("Database error in user.aliasExists.");
                console.log(err);
                callback({
                    error: "There was a database error checking whether the alias exists.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            callback(null, data[0] && data[0].length > 0);
        }
    );
};

/**
 * Determines whether the email address already exists.
 * @param {string} email The email to check.
 * @param {number} userId The user ID to exclude from the check.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.emailExists = function(email, userId, callback) {
    "use strict";

    db.query(
        "SELECT UserID FROM tblUser WHERE Email = @email and UserID <> @userId",
        {
            email: {type: db.VARCHAR(256), value: email},
            userId: {type: db.INT, value: userId}
        },
        function(err, data) {
            if (err) {
                console.log("Database error in user.emailExists.");
                console.log(err);
                callback({
                    error: "There was a database error checking whether the email address exists.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            callback(null, data[0] && data[0].length > 0);
        }
    );
};

/**
 * Logs a user in.
 * @param {string} email The email address.
 * @param {string} password The password.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.login = function(email, password, callback) {
    "use strict";

    db.query(
        "SELECT UserID, PasswordHash, Salt, Alias, DOB, Validated FROM tblUser WHERE Email = @email",
        {email: {type: db.VARCHAR(256), value: email}},
        function(err, data) {
            var user, salt;

            if (err) {
                console.log("Database error in user.login.");
                console.log(err);
                callback({
                    error: "There was a database error logging in.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (!data[0] || data[0].length === 0) {
                callback({
                    error: "Invalid email address or password.",
                    status: 401
                });
                return;
            }

            user = data[0][0];

            if (!user.Validated) {
                callback(null, {validated: false});
                return;
            }

            getHashedPassword(password, user.Salt, function(hashedPassword) {
                if (hashedPassword !== user.PasswordHash) {
                    callback({
                        error: "Invalid email address or password.",
                        status: 401
                    });
                    return;
                }

                db.query(
                    "SELECT r.Role from tblRole r INNER JOIN tblUserRole ur ON r.RoleID = ur.RoleID WHERE ur.UserID = @userId",
                    {userId: {type: db.INT, value: user.UserID}},
                    function(err, data) {
                        if (err) {
                            console.log("Database error in user.login.");
                            console.log(err);
                            callback({
                                error: "There was a database error logging in.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        var accountLinks = [{
                            url: "/account",
                            text: "Account"
                        }];

                        if (data[0]) {
                            _(data[0]).each(function(row) {
                                switch (row.Role) {
                                    case "SiteAdmin":
                                        accountLinks.push({
                                            url: "/admin",
                                            text: "Admin"
                                        });
                                        break;
                                }
                            });
                        }

                        callback(null, {
                            id: user.UserID,
                            alias: user.Alias,
                            email: email,
                            dob: new Date(user.DOB).toISOString(),
                            validated: user.Validated,
                            accountLinks: accountLinks
                        });
                    }
                );
            });
        }
    );
};

/**
 * Registers a user.
 * @param {string} email The user's email address.
 * @param {string} password The user's desired password.
 * @param {string} alias The user's desired alias.
 * @param {string} dob The user's date of birth.
 * @param {object} captchaData The captcha data from the server.
 * @param {string} captchaResponse The captcha response from the user.
 * @param {function(null)|function(object)} callback The callback function.
 */
module.exports.register = function(email, password, alias, dob, captchaData, captchaResponse, callback) {
    "use strict";

    var User = this;

    // First, we will run the non-database validations.
    all(
        // Basic data checks.
        (function() {
            var deferred = new Deferred();

            // Email is required.
            if (typeof email !== "string" || email.length === 0) {
                deferred.reject({
                    error: "You must enter an email address.",
                    status: 400
                });
                return false;
            }

            // Email must be an email address.
            if (!/^[a-zA-Z0-9.!#$%&'*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(email)) {
                deferred.reject({
                    error: "The email address you entered is not valid.",
                    status: 400
                });
                return false;
            }

            // Password is required.
            if (typeof password !== "string" || password.length === 0) {
                deferred.reject({
                    error: "You must enter a password.",
                    status: 400
                });
                return false;
            }

            // Password must be at least 6 characters.
            if (password.length < 6) {
                deferred.reject({
                    error: "Your password must be at least 6 characters.",
                    status: 400
                });
                return false;
            }

            // Alias is required.
            if (typeof alias !== "string" || alias.length === 0) {
                deferred.reject({
                    error: "You must enter an alias.",
                    status: 400
                });
                return false;
            }

            // Alias must be at least 3 characters.
            if (alias.length < 3) {
                deferred.reject({
                    error: "Your alias must be at least 3 characters.",
                    status: 400
                });
                return false;
            }

            // DOB is required.
            if (typeof dob !== "string" || dob.length === 0) {
                deferred.reject({
                    error: "You must enter a date of birth.",
                    status: 400
                });
                return false;
            }

            // Captcha response is required.
            if (typeof captchaResponse !== "string" || captchaResponse.length === 0) {
                deferred.reject({
                    error: "You must type in the characters as shown.",
                    status: 400
                });
                return false;
            }

            deferred.resolve(true);

            return true;
        }()),

        // Ensure the user is of age for COPPA.
        (function() {
            var deferred = new Deferred();

            User.isDobValid(dob, function(err, data) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                if (!data) {
                    deferred.reject({
                        error: "You must be at least 13 years of age to register.",
                        status: 400
                    });
                    return;
                }

                deferred.resolve(true);
            });

            return deferred.promise;
        }()),

        // Ensure the captcha value is correct.
        (function() {
            var deferred = new Deferred();

            captcha.isCaptchaValid(captchaData, captchaResponse, function(err, data) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                if (!data) {
                    deferred.reject({
                        error: "The characters you typed do not match the image.",
                        status: 400
                    });
                    return;
                }

                deferred.resolve(true);
            });

            return deferred.promise;
        }())
    ).then(
        // Next, we will run the database validations.
        function() {
            all(
                // Ensure the email address is not in use.
                (function() {
                    var deferred = new Deferred();

                    User.emailExists(email, 0, function(err, data) {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }

                        if (data) {
                            deferred.reject({
                                error: "The email address you entered is already in use.",
                                status: 400
                            });
                            return;
                        }

                        deferred.resolve(true);
                    });

                    return deferred.promise;
                }()),

                // Ensure the alias is not in use.
                (function () {
                    var deferred = new Deferred();

                    User.aliasExists(alias, 0, function(err, data) {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }

                        if (data) {
                            deferred.reject({
                                error: "The alias you entered is already in use.",
                                status: 400
                            });
                            return;
                        }

                        deferred.resolve(true);
                    });

                    return deferred.promise;
                }())
            ).then(
                // All the validations passed, run the registration.
                function() {
                    var salt = guid.v4();
                    getHashedPassword(password, salt, function(hashedPassword) {
                        var validationCode = guid.v4();
                        db.query(
                            "INSERT INTO tblUser (Email, DOB, Alias, Salt, PasswordHash, Validated, ValidationCode) VALUES (@email, @dob, @alias, @salt, @passwordHash, 0, @validationCode); SELECT SCOPE_IDENTITY() UserID;",
                            {
                                email: {type: db.VARCHAR(256), value: email},
                                dob: {type: db.DATETIME, value: new Date(dob)},
                                alias: {type: db.VARCHAR(20), value: alias},
                                salt: {type: db.UNIQUEIDENTIFIER, value: salt},
                                passwordHash: {type: db.VARCHAR(256), value: hashedPassword},
                                validationCode: {type: db.UNIQUEIDENTIFIER, value: validationCode}
                            },
                            function(err, data) {
                                if (err) {
                                    console.log("Database error in user.aliasExists.");
                                    console.log(err);
                                    callback({
                                        error: "There was a database error registering your account.  If you need help registering, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                        status: 500
                                    });
                                    return;
                                }

                                if (!data[0] || data[0].length === 0) {
                                    console.log("Newly created user not found in the database.");
                                    console.log(email);
                                    callback({
                                        error: "There was a database error registering your account.  If you need help registering, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                        status: 500
                                    });
                                    return;
                                }

                                // Send validation email.
                                User.sendValidationEmail(data[0][0].UserID, email, alias, validationCode, function(err) {
                                    if (err) {
                                        console.log("Error sending validation email in user.register.");
                                        console.log(err);
                                        callback({
                                            error: "There was an email error in user.register.  If you need help registering, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                            status: 500
                                        });
                                        return;
                                    }

                                    callback();
                                });
                            }
                        );
                    });
                },

                // If any of the functions error out, it will be handled here.
                function(err) {
                    callback(err);
                }
            );
        },

        // If any of the functions error out, it will be handled here.
        function(err) {
            callback(err);
        }
    );
};

/**
 * Validates an account.
 * @param {number} userId The user ID of the account to validate.
 * @param {string} validationCode The validation code.
 * @param {function} callback The callback function.
 */
module.exports.validateAccount = function(userId, validationCode, callback) {
    "use strict";

    userId = +userId;
    db.query(
        "SELECT UserID FROM tblUser WHERE UserID = @userId AND ValidationCode = @validationCode",
        {
            userId: {type: db.INT, value: userId},
            validationCode: {type: db.UNIQUEIDENTIFIER, value: validationCode}
        },
        function(err, data) {
            if (err) {
                console.log("Database error retrieving user in user.validateAccount.");
                console.log(err);
                callback({
                    error: "There was a database error validating your account.  If you need help validating your account, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                    status: 500
                });
                return;
            }

            if (!data[0] || data[0].length === 0) {
                console.log("Validation information not found in the database.");
                console.log(userId, validationCode);
                callback({
                    error: "Your validation information was incorrect.  If you need help validating your account, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                    status: 400
                });
                return;
            }

            db.query(
                "UPDATE tblUser SET Validated = 1, ValidationDate = GETUTCDATE() WHERE UserId = @userId",
                {
                    userId: {type: db.INT, value: userId}
                },
                function(err) {
                    if (err) {
                        console.log("Database error validating user in user.validateAccount.");
                        console.log(err);
                        callback({
                            error: "There was a database validating your account.  If you need help validating your account, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                            status: 500
                        });
                        return;
                    }

                    callback();
                }
            );
        }
    );
};

/**
 * Sends a user an email to begin the password recovery process.
 * @param {string} email The user's email address.
 * @param {function} callback The callback function.
 */
module.exports.forgotPassword = function(email, callback) {
    "use strict";

    var User = this;

    // Email is required.
    if (typeof email !== "string" || email.length === 0) {
        callback({
            error: "You must enter an email address.",
            status: 400
        });
        return;
    }

    // Ensure the email exists.
    User.emailExists(email, 0, function(err, data) {
        if (err) {
            callback(err);
            return;
        }

        if (!data) {
            callback({
                error: "The email address does not exist in our system.",
                status: 400
            });
            return;
        }

        // Get the user information.
        db.query(
            "SELECT UserID, Alias, ValidationCode, Validated FROM tblUser WHERE Email = @email",
            {
                email: {type: db.VARCHAR(256), value: email}
            },
            function(err, data) {
                var user;

                if (err) {
                    console.log("Database error retrieving user in user.forgotPassword.");
                    console.log(err);
                    callback({
                        error: "There was a database error requesting reset password authorization.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                        status: 500
                    });
                    return;
                }

                if (!data[0] || data[0].length === 0) {
                    console.log("Confirmed user not found in the database.");
                    console.log(email);
                    callback({
                        error: "There was a database error requesting reset password authorization.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                        status: 500
                    });
                    return;
                }

                user = data[0][0];

                if (user.Validated) {
                    // Get whether the user already has an active reset password request.
                    db.query(
                        "SELECT COUNT(AuthorizationID) Requests FROM tblPasswordChangeAuthorization WHERE UserID = @userId AND ExpirationDate > GETUTCDATE()",
                        {
                            userId: {type: db.INT, value: user.UserID}
                        },
                        function(err, data) {
                            var authorizationCode;

                            if (err) {
                                console.log("Database error checking for existing authorizations in user.forgotPassword.");
                                console.log(err);
                                callback({
                                    error: "There was a database error requesting reset password authorization.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                    status: 500
                                });
                                return;
                            }

                            if (!data[0] || data[0].length === 0) {
                                console.log("Missing authorization counts in database in user.forgotPassword.");
                                console.log(data);
                                callback({
                                    error: "There was a database error requesting reset password authorization.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                    status: 500
                                });
                                return;
                            }

                            if (data[0][0].Requests > 0) {
                                callback({
                                    error: "You have requested a reset password request too recently.  Please try again later.",
                                    status: 403
                                });
                                return;
                            }

                            authorizationCode = guid.v4();

                            db.query(
                                "INSERT INTO tblPasswordChangeAuthorization (UserID, AuthorizationCode, ExpirationDate, CrDate) VALUES (@userId, @authorizationCode, DATEADD(HOUR, 2, GETUTCDATE()), GETUTCDATE());",
                                {
                                    userId: {type: db.INT, value: user.UserID},
                                    authorizationCode: {type: db.UNIQUEIDENTIFIER, value: authorizationCode}
                                },
                                function(err) {
                                    if (err) {
                                        console.log("Database error creating database authorizations in user.forgotPassword.");
                                        console.log(err);
                                        callback({
                                            error: "There was a database error requesting reset password authorization.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                            status: 500
                                        });
                                        return;
                                    }

                                    User.sendResetPasswordEmail(user.UserID, email, user.Alias, authorizationCode, function(err) {
                                        if (err) {
                                            console.log("Error sending reset password email in user.forgotPassword.");
                                            console.log(err);
                                            callback({
                                                error: "There was an email error in user.forgotPassword.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                                status: 500
                                            });
                                            return;
                                        }

                                        callback(null, false);
                                    });
                                }
                            );
                        }
                    );
                } else {
                    // User requires validation, resend validation email.
                    // TODO: Limit to one per hour.
                    User.sendValidationEmail(data[0][0].UserID, email, data[0][0].Alias, data[0][0].ValidationCode, function(err) {
                        if (err) {
                            console.log("Error sending validation email in user.forgotPassword.");
                            console.log(err);
                            callback({
                                error: "There was an email error in user.forgotPassword.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                status: 500
                            });
                            return;
                        }

                        callback(null, true);
                    });
                }
            }
        );
    });
};

/**
 * Checks to see if a password reset request is authorized.
 * @param {number} userId The user ID.
 * @param {string} authorizationCode The authorization code.
 * @param {function} callback The callback function.
 */
module.exports.passwordResetRequest = function(userId, authorizationCode, callback) {
    "use strict";

    userId = +userId;

    db.query(
        "SELECT COUNT(AuthorizationID) Requests FROM tblPasswordChangeAuthorization WHERE UserID = @userId AND AuthorizationCode = @authorizationCode AND ExpirationDate >= GETUTCDATE()",
        {
            userId: {type: db.INT, value: userId},
            authorizationCode: {type: db.UNIQUEIDENTIFIER, value: authorizationCode}
        },
        function(err, data) {
            if (err) {
                console.log("Database error retrieving password reset request in user.passwordResetRequest.");
                console.log(err);
                callback({
                    error: "There was a database error confirming your password reset request.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                    status: 500
                });
                return;
            }

            if (!data[0] || data[0].length === 0 || !data[0][0] || data[0][0].length === 0) {
                console.log("Missing authorization counts in database in user.passwordResetRequest.");
                console.log(err);
                callback({
                    error: "There was a database error confirming your password reset request.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                    status: 500
                });
                return;
            }

            if (data[0][0].Requests === 0) {
                callback({
                    error: "The request to reset your password is not valid.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                    status: 400
                });
                return;
            }

            callback();
        }
    );
};

/**
 * Resets a user's password.
 * @param {number} userId The user ID.
 * @param {string} authorizationCode The authorizationCode.
 * @param {string} password The user's desired password.
 * @param {object} captchaData The captcha data from the server.
 * @param {string} captchaResponse The captcha response from the user.
 * @param {function} callback The callback function.
 */
module.exports.passwordReset = function(userId, authorizationCode, password, captchaData, captchaResponse, callback) {
    "use strict";

    var User = this;

    userId = +userId;

    // First, we will run the non-database validations.
    all(
        // Basic data checks.
        (function() {
            var deferred = new Deferred();

            // Password is required.
            if (typeof password !== "string" || password.length === 0) {
                deferred.reject({
                    error: "You must enter a password.",
                    status: 400
                });
                return false;
            }

            // Password must be at least 6 characters.
            if (password.length < 6) {
                deferred.reject({
                    error: "Your password must be at least 6 characters.",
                    status: 400
                });
                return false;
            }

            // Captcha response is required.
            if (typeof captchaResponse !== "string" || captchaResponse.length === 0) {
                deferred.reject({
                    error: "You must type in the characters as shown.",
                    status: 400
                });
                return false;
            }

            deferred.resolve(true);

            return true;
        }()),

        // Ensure the captcha value is correct.
        (function() {
            var deferred = new Deferred();

            captcha.isCaptchaValid(captchaData, captchaResponse, function(err, data) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                if (!data) {
                    deferred.reject({
                        error: "The characters you typed do not match the image.",
                        status: 400
                    });
                    return;
                }

                deferred.resolve(true);
            });

            return deferred.promise;
        }())
    ).then(
        // Next, we will run the database validations.
        function() {
            User.passwordResetRequest(userId, authorizationCode, function(err) {
                if (err) {
                    callback(err);
                    return;
                }

                // All the validations passed, reset the password.
                var salt = guid.v4();
                getHashedPassword(password, salt, function(hashedPassword) {
                    db.query(
                        "UPDATE tblPasswordChangeAuthorization SET ExpirationDate = GETUTCDATE() WHERE UserID = @userId AND AuthorizationCode = @authorizationCode; UPDATE tblUser SET PasswordHash = @passwordHash, Salt = @salt WHERE UserID = @userId",
                        {
                            userId: {type: db.INT, value: userId},
                            authorizationCode: {type: db.UNIQUEIDENTIFIER, value: authorizationCode},
                            passwordHash: {type: db.VARCHAR(256), value: hashedPassword},
                            salt: {type: db.UNIQUEIDENTIFIER, value: salt}
                        },
                        function(err) {
                            if (err) {
                                console.log("Database error in user.passwordReset.");
                                console.log(err);
                                callback({
                                    error: "There was a database error while resetting your password.  If you need help resetting your password, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                    status: 500
                                });
                                return;
                            }

                            callback();
                        }
                    );
                });
            });
        },

        // If any of the functions error out, it will be handled here.
        function(err) {
            callback(err);
        }
    );
};

/**
 * Creates a request for an email change.
 * @param {number} userId The user ID.
 * @param {string} password The user's password.
 * @param {object} captchaData The captcha data from the server.
 * @param {string} captchaResponse The captcha response from the user.
 * @param {function} callback The callback function.
 */
module.exports.emailChangeRequest = function(userId, password, captchaData, captchaResponse, callback) {
    "use strict";

    var User = this;

    userId = +userId;

    captcha.isCaptchaValid(captchaData, captchaResponse, function(err, data) {
        if (err) {
            callback(err);
            return;
        }

        db.query(
            "SELECT PasswordHash, Salt, Alias, Email, Validated FROM tblUser WHERE UserID = @userId",
            {userId: {type: db.INT, value: userId}},
            function(err, data) {
                var user;

                if (err) {
                    console.log("Database error in user.login.");
                    console.log(err);
                    callback({
                        error: "There was a database error logging in.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data[0] || data[0].length === 0) {
                    callback({
                        error: "Invalid user.  Please reload the page and try again.",
                        status: 401
                    });
                    return;
                }

                user = data[0][0];

                if (!user.Validated) {
                    callback({
                        error: "This account is not yet validated.  Please reload the page and try again.",
                        status: 401
                    });
                    return;
                }

                getHashedPassword(password, user.Salt, function(hashedPassword) {
                    var authorizationCode;

                    if (hashedPassword !== user.PasswordHash) {
                        callback({
                            error: "Invalid password.",
                            status: 401
                        });
                        return;
                    }

                    authorizationCode = guid.v4();

                    db.query(
                        "INSERT INTO tblEmailChangeAuthorization (UserID, AuthorizationCode, ExpirationDate, CrDate) VALUES (@userId, @authorizationCode, DATEADD(HOUR, 2, GETUTCDATE()), GETUTCDATE())",
                        {
                            userId: {type: db.INT, value: userId},
                            authorizationCode: {type: db.UNIQUEIDENTIFIER, value: authorizationCode}
                        },
                        function(err) {
                            if (err) {
                                console.log("Database error in user.emailChangeRequest.");
                                console.log(err);
                                callback({
                                    error: "There was a database error processing your email change request.  Please reload the page and try again.",
                                    status: 500
                                });
                                return;
                            }

                            // Send email change request email.
                            User.sendEmailChangeRequestEmail(userId, user.Email, user.Alias, authorizationCode, function(err) {
                                if (err) {
                                    console.log("Error sending change request email in user.emailChangeRequest.");
                                    console.log(err);
                                    callback({
                                        error: "There was an email error in user.emailChangeRequest.  If you need help changing your email address, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                        status: 500
                                    });
                                    return;
                                }

                                callback();
                            });
                        }
                    );
                });
            }
        );
    });
};

/**
 * Sends a validation email to the user.
 * @param {number} userId The user ID.
 * @param {string} email The user's email address.
 * @param {string} alias The user's alias.
 * @param {string} validationCode The validation code.
 * @param {function(null)|function(object)} callback The callback function.
 */
module.exports.sendValidationEmail = function(userId, email, alias, validationCode, callback) {
    "use strict";

    template.get(["email/to", "email/htmlTemplate", "email/textTemplate", "email/validation/html", "email/validation/text"], function(err, templates) {
        if (err) {
            callback(err);
            return;
        }
        mail.send({
            to: templates["email/to"]({to: [{alias: alias, email: email}]}),
            subject: "Please validate your registration",
            html: templates["email/htmlTemplate"]({
                html: templates["email/validation/html"]({
                    alias: alias,
                    userId: userId,
                    validationCode: validationCode
                }),
                email: email,
                reason: "this email address was registered on the site",
                year: moment().year()
            }),
            text: templates["email/textTemplate"]({
                text: templates["email/validation/text"]({
                    alias: alias,
                    userId: userId,
                    validationCode: validationCode
                }),
                email: email,
                reason: "this email address was registered on the site",
                year: moment().year()
            })
        }, callback);
    });
};

/**
 * Sends a reset password email to the user.
 * @param {number} userId The user ID.
 * @param {string} email The user's email address.
 * @param {string} alias The user's alias.
 * @param {string} authorizationCode The authorization code.
 * @param {function(null)|function(object)} callback The callback function.
 */
module.exports.sendResetPasswordEmail = function(userId, email, alias, authorizationCode, callback) {
    "use strict";

    template.get(["email/to", "email/htmlTemplate", "email/textTemplate", "email/resetPassword/html", "email/resetPassword/text"], function(err, templates) {
        if (err) {
            callback(err);
            return;
        }
        mail.send({
            to: templates["email/to"]({to: [
                {alias: alias, email: email}
            ]}),
            subject: "Reset password request",
            html: templates["email/htmlTemplate"]({
                html: templates["email/resetPassword/html"]({
                    alias: alias,
                    userId: userId,
                    authorizationCode: authorizationCode
                }),
                email: email,
                reason: "a password reset was requested for this email address",
                year: moment().year()
            }),
            text: templates["email/textTemplate"]({
                text: templates["email/resetPassword/text"]({
                    alias: alias,
                    userId: userId,
                    authorizationCode: authorizationCode
                }),
                email: email,
                reason: "a password reset was requested for this email address",
                year: moment().year()
            })
        }, callback);
    });
};

/**
 * Sends a change request email to the user.
 * @param {number} userId The user ID.
 * @param {string} email The user's email address.
 * @param {string} alias The user's alias.
 * @param {string} authorizationCode The authorization code.
 * @param {function(null)|function(object)} callback The callback function.
 */
module.exports.sendEmailChangeRequestEmail = function(userId, email, alias, authorizationCode, callback) {
    "use strict";

    template.get(["email/to", "email/htmlTemplate", "email/textTemplate", "email/changeEmail/html", "email/changeEmail/text"], function(err, templates) {
        if (err) {
            callback(err);
            return;
        }
        mail.send({
            to: templates["email/to"]({to: [
                {alias: alias, email: email}
            ]}),
            subject: "Change email request",
            html: templates["email/htmlTemplate"]({
                html: templates["email/changeEmail/html"]({
                    alias: alias,
                    userId: userId,
                    authorizationCode: authorizationCode
                }),
                email: email,
                reason: "an email change was requested for this email address",
                year: moment().year()
            }),
            text: templates["email/textTemplate"]({
                text: templates["email/changeEmail/text"]({
                    alias: alias,
                    userId: userId,
                    authorizationCode: authorizationCode
                }),
                email: email,
                reason: "an email change was requested for this email address",
                year: moment().year()
            })
        }, callback);
    });
};
