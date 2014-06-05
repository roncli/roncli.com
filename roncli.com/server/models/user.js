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
            alias: {type: "varchar", size: 50, value: alias},
            userId: {type: "int", value: userId}
        },
        function(data) {
            if (data.err) {
                console.log("Database error in user.aliasExists.");
                console.log(data.err);
                callback({
                    error: "There was a database error in user.aliasExists.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            callback(null, data.tables && data.tables[0] && data.tables[0].rows.length > 0);
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
            email: {type: "varchar", size: 255, value: email},
            userId: {type: "int", value: userId}
        },
        function(data) {
            if (data.err) {
                console.log("Database error in user.emailExists.");
                console.log(data.err);
                callback({
                    error: "There was a database error in user.emailExists.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            callback(null, data.tables && data.tables[0] && data.tables[0].rows.length > 0);
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
        "SELECT UserID, PasswordHash, Salt, Alias, Email, DOB FROM tblUser WHERE Email = @email",
        {email: {type: "varchar", size: 255, value: email}},
        function(data) {
            if (data.err) {
                console.log("Database error in user.login.");
                console.log(data.err);
                callback({
                    error: "There was a database error in user.login.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (!data.tables || !data.tables[0] || data.tables[0].rows.length === 0) {
                callback({
                    error: "Invalid email address or password.",
                    status: 401
                });
                return;
            }

            var user = data.tables[0].rows[0],
                salt = guid.unparse(user.Salt);

            getHashedPassword(password, salt, function(hashedPassword) {
                if (hashedPassword !== user.PasswordHash) {
                    callback({
                        error: "Invalid email address or password.",
                        status: 401
                    });
                    return;
                }

                db.query(
                    "SELECT r.Role from tblRole r INNER JOIN tblUserRole ur ON r.RoleID = ur.RoleID WHERE ur.UserID = @userId",
                    {userId: {type: "int", value: user.UserID}},
                    function(data) {
                        if (data.err) {
                            console.log("Database error in user.login.");
                            console.log(data.err);
                            callback({
                                error: "There was a database error in user.login.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        var accountLinks = [{
                            url: "/account",
                            text: "Account"
                        }];

                        if (data.tables && data.tables[0]) {
                            _(data.tables[0].rows).each(function(row) {
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
                            email: user.Email,
                            dob: new Date(user.DOB).toISOString(),
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

            if (typeof password !== "string" || password.length === 0) {
                deferred.reject({
                    error: "You must enter a password.",
                    status: 400
                });
                return false;
            }

            if (password.length < 6) {
                deferred.reject({
                    error: "Your password must be at least 6 characters.",
                    status: 400
                });
                return false;
            }

            if (typeof alias !== "string" || alias.length === 0) {
                deferred.reject({
                    error: "You must enter an alias.",
                    status: 400
                });
                return false;
            }

            if (alias.length < 3) {
                deferred.reject({
                    error: "Your alias must be at least 3 characters.",
                    status: 400
                });
                return false;
            }

            if (typeof dob !== "string" || dob.length === 0) {
                deferred.reject({
                    error: "You must enter a date of birth.",
                    status: 400
                });
                return false;
            }

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
        function() {
            // Next, we will run the database validations.
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
                }())
            ).then(
                function() {
                    // All the validations passed, run the registration.
                    var salt = guid.v4();
                    getHashedPassword(password, salt, function(hashedPassword) {
                        var validationCode = guid.v4();
                        db.query(
                            "INSERT INTO tblUser (Email, DOB, Alias, Salt, PasswordHash, Validated, ValidationCode) VALUES (@email, @dob, @alias, @salt, @passwordHash, 0, @validationCode); SELECT SCOPE_IDENTITY() UserID;",
                            {
                                email: {type: "varchar", size: 256, value: email},
                                dob: {type: "datetime", value: new Date(dob)},
                                alias: {type: "varchar", size: 20, value: alias},
                                salt: {type: "uniqueidentifier", value: salt},
                                passwordHash: {type: "varchar", size: 256, value: hashedPassword},
                                validationCode: {type: "uniqueidentifier", value: validationCode}
                            },
                            function(data) {
                                if (data.err) {
                                    console.log("Database error in user.aliasExists.");
                                    console.log(data.err);
                                    callback({
                                        error: "There was a database error in user.register.  If you need help registering, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>.",
                                        status: 500
                                    });
                                    return;
                                }

                                // Send validation email.
                                User.sendValidationEmail(data.UserID, email, alias, validationCode, function(err, data) {
                                    if (err) {
                                        console.log("Error sending validation email.");
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
                html: templates["email/validation/html"]({}),
                email: email,
                reason: "this email address was registered on the site",
                year: moment().year()
            }),
            text: templates["email/textTemplate"]({
                text: templates["email/validation/text"]({}),
                email: email,
                reason: "this email address was registered on the site",
                year: moment().year()
            })
        }, callback);
    });
};
