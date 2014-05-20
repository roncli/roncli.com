module.exports = {
    get: function(req, callback) {
        "use strict";

        // Return the time.
        callback({
            id: 0,
            time: new Date().getTime()
        });
    }
};
