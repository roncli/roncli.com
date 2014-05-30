var moment = require("moment");

module.exports.isCaptchaValid = function(captcha, response, callback) {
    "use strict";

    // Ensure the CAPTCHA image is not expired.
    if (!captcha || !captcha.text || !captcha.expires || !moment.isMoment(captcha.expires)) {
        callback({
            error: "Captcha image data was missing or invalid on the server.  Please reload the page and try again.",
            status: 500
        });
        return;
    }
    callback(null, captcha && response === captcha.text && moment().isBefore(captcha.expires));
};
