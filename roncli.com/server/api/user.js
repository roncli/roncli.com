var moment = require("moment");
var user = require("../models/user.js");

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
                        switch (err.type) {
                            case "database":
                                req.res.status(500);
                                callback(err);
                                return;
                            case "invalid":
                                req.res.status(401);
                                callback(err);
                                return;
                            default:
                                req.res.status(500);
                                callback(err);
                                return;
                        }
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

    var userId = req.session.user ? req.session.user.id : 0,
        date;

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "validate":
                    // Attempt to validate data.
                    if (req.body.coppaDob) {
                        // Ensure the user's DOB is at least 13 years old.
                        date = moment(req.body.coppaDob);

                        if (date === false) {
                            req.res.status(400);
                            callback({error: "Invalid date."});
                            return;
                        }

                        callback({valid: moment().diff(date, "years", true) >= 13});
                        return;
                    }

                    if (req.body.aliasExists) {
                        // Ensure the chosen alias is unique.
                        user.aliasExists(req.body.aliasExists, userId, function(err, data) {
                            if (err) {
                                req.res.status(500);
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
                                req.res.status(500);
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
                            switch (err.type) {
                                case "database":
                                    req.res.status(500);
                                    callback(err);
                                    return;
                                case "invalid":
                                    req.res.status(401);
                                    callback(err);
                                    return;
                                default:
                                    req.res.status(500);
                                    callback(err);
                                    return;
                            }
                        }
                        req.session.user = data;

                        if (req.body.saveLogin) {
                            req.res.cookie("login", {email: req.body.email, password: req.body.password}, {expires: moment().add("years", 1).toDate()});
                        }

                        callback(data);
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
