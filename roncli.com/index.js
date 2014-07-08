var express = require("express"),
    domain = require("domain"),
    path = require("path"),
    moment = require("moment"),
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
app.use(express.session({secret: "tmp"}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded());

// Remove powered by header.
app.use(function(req, res, next) {
    "use strict";

    res.removeHeader("X-Powered-By");
    next();
});

// Setup domains.
app.use(function(req, res, next) {
    "use strict";

    var d = domain.create();
    d.add(req);
    d.add(res);

    res.on("close", function() {
        console.log("res closed");
        d.dispose();
    });

    d.on("error", function(err) {
        console.log("d on error");
        next(err);
    });

    d.run(next);
});

// Set up Captcha route.
app.get("/images/captcha.png", function(req, res) {
    "use strict";

    var captcha = captchagen();

    req.session.captcha = {text: captcha.text(), expires: moment().add("minutes", 5)};

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
if (require.main && (require.main === module || (require.main.filename.match(/interceptor\.js$/) && require.main.children[0] === module))) {
    start();
} else {
    console.error("You can only load this website if it is the main script that is executed, or if it is loaded through iisnode.  If iisnode is installed in a non-standard location, you will need to modify the location in the index.js file.");
}

exports.app = app;
