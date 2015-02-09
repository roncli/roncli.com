var config = require("./server/privateConfig").server,
    express = require("express"),
    domain = require("domain"),
    path = require("path"),
    moment = require("moment"),
    rendr = require("rendr"),
    captchagen = require("./server/captcha/captchagen"),
    compression = require("compression"),
    morgan = require("morgan"),
    morganExtensions = require("./server/morgan/morgan-extensions"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    bodyParser = require("body-parser"),
    rss = require("./server/rss/rss"),
    app = express(),
    ApiDataAdapter = require("./server/ApiDataAdapter"),
    server = rendr.createServer({
        dataAdapter: new ApiDataAdapter(),
        errorHandler: require("errorhandler")
    });

// Add morgan extensions.
morganExtensions(morgan);

// Initialize middleware stack.
app.use(compression());
app.use(morgan(":colorstatus \x1b[30m\x1b[1m:method\x1b[0m :url\x1b[30m\x1b[1m:newline    Date :date[iso]    IP :remote-addr    Time :colorresponse ms"));
app.use(cookieParser(config.secret));
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
        d.dispose();
    });

    d.on("error", function(err) {
        console.log("Domain error");
        console.log(err);
        next(err);
    });

    d.run(next);
});

// Setup RSS route.
app.get("*.rss", function(req, res) {
    "use strict";

    rss(req, res);
});

// Set up Captcha route.
app.get("/images/captcha.png", function(req, res) {
    "use strict";

    var captcha = captchagen();

    req.session.captcha = {text: captcha.text(), expires: moment().add(5, "minutes")};

    res.writeHead(200, {"Content-Type": "image/png", "Cache-Control": "no-cache"});
    res.end(captcha.buffer());
});

// Add the rendr server.
app.use(server.handle);

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
