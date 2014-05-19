module.exports = {
    get: function(req, callback) {
        "use strict";

        // Return the time.
        callback({
            time: new Date().getTime()
        });
    }
};
