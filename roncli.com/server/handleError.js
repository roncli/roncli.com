module.exports = function(err, req) {
    "use strict";

    if (!err.status) {
        console.log("Unknown error");
        console.log(err);
        err.status = 500;
    }
    req.res.status(err.status);
};
