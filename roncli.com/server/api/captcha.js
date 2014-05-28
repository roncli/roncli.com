module.exports.post = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "validate":
                    // Attempt to validate data.
                    if (req.body.response) {
                        // Ensure the CAPTCHA image is not expired.
                        callback({
                            valid: req.session.captcha &&
                                req.body.response === req.session.captcha.text &&
                                new Date().getTime() < new Date(req.session.captcha.expires).getTime()
                        });
                        return;
                    }

                    break;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
