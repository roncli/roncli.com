var db = require("../database/database.js"),
    crypto = require("crypto"),
    _ = require("underscore");

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
                    error: "Database error in user.aliasExists.",
                    data: data.err
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
                    error: "Database error in user.emailExists.",
                    data: data.err
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
                    error: "Database error in user.login.",
                    data: data.err,
                    type: "database"
                });
                return;
            }

            if (!data.tables || !data.tables[0] || data.tables[0].rows.length === 0) {
                callback({
                    error: "Invalid email address or password.",
                    type: "invalid"
                });
                return;
            }

            var sha1 = crypto.createHash("sha1"),
                user = data.tables[0].rows[0];

            sha1.write(password + "-" + user.Salt, "utf8", function() {
                sha1.end();
                var hashedPassword = sha1.read().toString("hex").toUpperCase();

                if (hashedPassword !== user.PasswordHash) {
                    callback({
                        error: "Invalid email address or password.",
                        type: "invalid"
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
                                error: "Database error in user.login.",
                                data: data.err,
                                type: "database"
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
