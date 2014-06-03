var moment = require("moment");

module.exports.isCaptchaValid = function(captcha, response, callback) {
    "use strict";

    var expiration;

    // Ensure the CAPTCHA image exists.
    if (!captcha || !captcha.text || !captcha.expires) {
        console.log("Captcha does not exist.  Captcha object follows.");
        console.log(captcha);
        callback({
            error: "Captcha image data was missing or invalid on the server.  Please reload the page and try again.",
            status: 500
        });
        return;
    }

    // Ensure the CAPTCHA image expiration is valid.
    expiration = new Date(captcha.expires);
    if (!moment(expiration).isValid()) {
        console.log("Captcha expiration is invalid.  Captcha object follows.");
        console.log(captcha);
        callback({
            error: "Captcha image data was missing or invalid on the server.  Please reload the page and try again.",
            status: 500
        });
        return;
    }

    // Ensure the CAPTCHA image is not expired.
    if (!moment().isBefore(expiration)) {
        callback({
            error: "Captcha image expired.  Please retype the characters shown.",
            status: 400
        });
    }

    callback(null, captcha && response === captcha.text);
};
