/// <reference path="typings/node/node.d.ts"/>
var express = require("express"),
    app = express(),
    morgan = require("morgan"),
    morganExtensions = require("../roncli.com/server/morgan/morgan-extensions"),
    db = require("../roncli.com/server/database/database");

// Add morgan extensions.
morganExtensions(morgan);

// Get IP address.
app.use(function(req, res, next) {
    "use strict";

    req.headers.ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    next();
});

// Initialize middleware stack.
app.use(morgan(":colorstatus \x1b[30m\x1b[1m:method\x1b[0m :url\x1b[30m\x1b[1m:newline    Date :date[iso]    IP :req[ip]    Time :colorresponse ms"));

// Redirect.
app.get("*", function(req, res) {
    var url = req.url;

    db.query(
        "SELECT RedirectID, ToURL FROM tblRedirect WHERE FromPath = @path",
        {path: {type: db.VARCHAR(256), value: url}},
        function(err, data) {
            if (err) {
                console.log("Error while looking up path.");
                console.log(err);
            }

            if (err || !data || !data.recordsets || !data.recordsets[0] || !data.recordsets[0][0] || !data.recordsets[0][0].ToURL) {
                res.redirect(301, "http://www.roncli.com" + url);
            } else {
                db.query(
                    "INSERT INTO tblRedirectHit (RedirectID, IP, Referrer, UserAgent) values (@redirectId, @ip, @referrer, @userAgent)",
                    {
                        redirectId: {type: db.INT, value: data.recordsets[0][0].RedirectID},
                        ip: {type: db.VARCHAR(15), value: req.headers.ip},
                        referrer: {type: db.VARCHAR(256), value: req.headers.referer ? req.headers.referer.substring(0, 256) : null},
                        userAgent: {type: db.VARCHAR(256), value: req.headers["user-agent"] ? req.headers["user-agent"].substring(0, 256) : null}
                    },
                    function(err) {
                        if (err) {
                            console.log("Error while recording hit.");
                            console.log(err);
                        }
                    }
                );
                res.redirect(301, data.recordsets[0][0].ToURL);
            }
        }
    )
});

/**
 * Start the Express server.
 */
function start() {
    "use strict";

    var port = process.env.PORT || 3031;
    app.listen(port);
    console.log("server pid %s listening on port %s in %s mode", process.pid, port, app.get("env"));
}

// Only start server if this script is executed, and not called via require.
if (require.main && (require.main === module || (/interceptor\.js$/.test(require.main.filename) && require.main.children[0] === module))) {
    start();
} else {
    console.error("You can only load this website if it is the main script that is executed, or if it is loaded through iisnode.  If iisnode is installed in a non-standard location, you will need to modify the location in the index.js file.");
}

exports.app = app;
