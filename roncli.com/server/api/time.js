module.exports = {
    get: function(req, query, callback) {
        "use strict";

        // Return the time.
        callback({
            id: 0,
            time: new Date().getTime()
        });
    }
};
