var captcha = require("../models/captcha");

module.exports.post = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "validate":
                    // Attempt to validate data.
                    if (req.body.response) {
                        captcha.isCaptchaValid(req.session.captcha, req.body.response, function(err, valid) {
                            if (err) {
                                req.res.status(err.status);
                                callback(err);
                                return;
                            }
                            callback({valid: valid});
                        });
                        return;
                    }

                    req.res.status(400);
                    callback({error: "You must type in the characters as shown."});
                    break;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
