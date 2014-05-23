var express = require("express"),
    path = require("path"),
    rendr = require("rendr"),
    captchagen = require("./server/captcha/captchagen.js"),
    app = express(),
    ApiDataAdapter = require("./server/ApiDataAdapter"),
    server = rendr.createServer({
        dataAdapter: new ApiDataAdapter()
    });

// Initialize Express middleware stack.
app.use(express.compress());
app.use(express.logger("[:date] :remote-addr :method :url HTTP/:http-version :status :res[content-length] \":user-agent\" :response-time \":referrer\""));
app.use(express.cookieParser("tmp"));
app.use(express.session());
app.use(express.static(path.join(__dirname, "public")));

// Remove powered by header.
app.use(function(err, req, res, next) {
    "use strict";

    res.removeHeader("X-Powered-By");
    next();
});

// Set up Captcha route.
app.get("/images/captcha.png", function(req, res) {
    "use strict";

    var captcha = captchagen();

    req.session.captcha = {text: captcha.text(), expires: new Date(new Date().getTime() + 5 * 60 * 1000)};

    res.writeHead(200, {"Content-Type": "image/png"});
    res.end(captcha.buffer());
});

// Add the rendr server.
app.use(server);

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
if (require.main === module) {
    start();
}

exports.app = app;
