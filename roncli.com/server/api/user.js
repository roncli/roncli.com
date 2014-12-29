var moment = require("moment"),
    user = require("../models/user.js"),
    handleError = require("../handleError");

module.exports.get = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            // Attempt to get data for the currently logged in user.
            if (req.session.user) {
                // Return the currently logged in user.
                callback(req.session.user);
                return;
            }

            // Attempt to log in the user from a cookie.
            if (req.cookies.login) {
                user.login(req.cookies.login.email, req.cookies.login.password, function(err, data) {
                    if (err) {
                        handleError(err, req);
                        callback(err);
                        return;
                    }
                    req.session.user = data;

                    callback(data);
                });
                return;
            }

            req.res.status(401);
            callback({error: "You are not logged in."});
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};

module.exports.post = function(req, callback) {
    "use strict";

    var userId = req.session.user ? req.session.user.id : 0;

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "validate":
                    // Attempt to validate data.
                    if (req.body.coppaDob) {
                        // Ensure the user's DOB is at least 13 years old.
                        user.isDobValid(req.body.coppaDob, function(err, data) {
                            if (err) {
                                handleError(err, req);
                                callback(err);
                                return;
                            }

                            callback({valid: data});
                        });
                        return;
                    }

                    if (req.body.aliasExists) {
                        // Ensure the chosen alias is unique.
                        user.aliasExists(req.body.aliasExists, userId, function(err, data) {
                            if (err) {
                                handleError(err, req);
                                callback(err);
                                return;
                            }

                            callback({valid: data});
                        });
                        return;
                    }

                    if (req.body.emailExists) {
                        // Ensure the chosen email is unique.
                        user.emailExists(req.body.emailExists, userId, function(err, data) {
                            if (err) {
                                handleError(err, req);
                                callback(err);
                                return;
                            }

                            callback({valid: data});
                        });
                        return;
                    }

                    break;
                case "login":
                    user.login(req.body.email, req.body.password, function(err, data) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        if (!data.validated) {
                            req.res.status(400);
                            callback({error: "You must validate your account before you can log in.  If you need help validating your account, please contact <a href=\"mailto:roncli@roncli.com\">roncli</a>."});
                            return;
                        }

                        req.session.user = data;

                        if (req.body.saveLogin && data.validated) {
                            req.res.cookie("login", {email: req.body.email, password: req.body.password}, {expires: moment().add("years", 1).toDate()});
                        }

                        callback(data);
                    });

                    return;
                case "register":
                    user.register(req.body.email, req.body.password, req.body.alias, req.body.dob, req.session.captcha, req.body.captcha, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "validate-account":
                    user.validateAccount(req.body.userId, req.body.validationCode, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "forgot-password":
                    user.forgotPassword(req.body.email, function(err, validationRequired) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        callback({validationRequired: validationRequired});
                    });

                    return;
                case "password-reset-request":
                    user.passwordResetRequest(req.body.userId, req.body.authorizationCode, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "password-reset":
                    user.passwordReset(req.body.userId, req.body.authorizationCode, req.body.password, req.session.captcha, req.body.captcha, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "change-email":
                    if (!userId) {
                        req.res.status(401);
                        callback({error: "You are not logged in."});
                        return;
                    }

                    user.changeEmail(userId, req.body.password, req.session.captcha, req.body.captcha, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "email-change-request":
                    user.emailChangeRequest(req.body.userId, req.body.authorizationCode, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "email-change":
                    user.emailChange(req.body.userId, req.body.authorizationCode, req.body.password, req.body.email, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "change-password":
                    user.changePassword(userId, req.body.oldPassword, req.body.newPassword, req.session.captcha, req.body.captcha, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "change-alias":
                    user.changeAlias(userId, req.body.alias, function(err) {
                        if (err) {
                            handleError(err, req);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });

                    return;
                case "logout":
                    delete req.session.user;
                    req.res.clearCookie("login");
                    req.res.status(204);
                    callback();

                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
