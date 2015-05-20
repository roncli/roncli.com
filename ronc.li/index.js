/// <reference path="typings/node/node.d.ts"/>
var express = require("express"),
    app = express(),
    domain = require("domain"),
    morgan = require("morgan"),
    morganExtensions = require("../roncli.com/server/morgan/morgan-extensions"),
    db = require("../roncli.com/server/database/database");

// Add morgan extensions.
morganExtensions(morgan);

// Initialize middleware stack.
app.use(morgan(":colorstatus \x1b[30m\x1b[1m:method\x1b[0m :url\x1b[30m\x1b[1m:newline    Date :date[iso]    IP :remote-addr    Time :colorresponse ms"));

// Setup domains.
app.use(function(req, res, next) {
    "use strict";

    var d = domain.create();
    d.add(req);
    d.add(res);

    res.on("close", function() {
        d.dispose();
    });

    d.on("error", function(err) {
        console.log("Domain error");
        console.log(err);
        next(err);
    });

    d.run(next);
});

// Redirect.
app.get("*", function(req, res) {
    var url = req.url;

    db.query(
        "SELECT ToURL FROM tblRedirect WHERE FromPath = @path",
        {path: {type: db.VARCHAR(255), value: url}},
        function(err, data) {
            if (err || !data || !data[0] || !data[0][0] || !data[0][0].ToURL) {
                res.redirect(301, "http://www.roncli.com" + url);
            } else {
                res.redirect(301, data[0][0].ToURL);
            }
        }
    )
});

/**
 * Start the Express server.
 */
function start() {
    "use strict";

    var port = process.env.PORT || 3030;
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
