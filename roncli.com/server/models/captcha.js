var moment = require("moment");

module.exports.isCaptchaValid = function(captcha, response, callback) {
    "use strict";

    var expiration;

    // Ensure the CAPTCHA image exists.
    if (!captcha || !captcha.text || !captcha.expires) {
        callback({
            error: "Captcha image data was missing or invalid on the server.  Please reload the page and try again.",
            status: 500
        });
        return;
    }

    // Ensure the CAPTCHA image is not expired.
    expiration = new Date(captcha.expires);
    if (!moment(expiration).isValid() || !moment().isBefore(expiration)) {
        callback({
            error: "Captcha image data was missing or invalid on the server.  Please reload the page and try again.",
            status: 500
        });
        return;
    }

    callback(null, captcha && response === captcha.text);
};
