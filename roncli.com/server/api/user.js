var moment = require("moment"),
    user = require("../models/user.js"),
    handleError = function(err, req) {
        "use strict";

        if (!err.status) {
            console.log("Unknown error");
            console.log(err);
            err.status = 500;
        }
        req.res.status(err.status);
    };

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
                        req.session.user = data;

                        if (req.body.saveLogin) {
                            req.res.cookie("login", {email: req.body.email, password: req.body.password}, {expires: moment().add("years", 1).toDate()});
                        }

                        callback(data);
                    });

                    return;
                case "register":
                    user.register(req.body.email, req.body.password, req.body.alias, req.body.dob, req.session.captcha, req.body.captcha, function(err, data) {
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
