var config = require("./server/privateConfig"),
    serverConfig = config.server,
    filesConfig = config.files,
    express = require("express"),
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
    multer = require("multer"),
    User = require("./server/models/user"),
    rss = require("./server/rss/rss"),
    app = express(),
    ApiDataAdapter = require("./server/ApiDataAdapter"),
    server = rendr.createServer({
        dataAdapter: new ApiDataAdapter(),
        errorHandler: require("errorhandler")
    }),
    upload = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, filesConfig.path);
            },
            filename: function(req, file, cb) {
                cb(null, file.originalname);
            }
        }),
        fileFilter: function(req, file, cb) {
            "use strict";

            var userId = req.session.user ? req.session.user.id : 0;

            if (userId === 0) {
                cb(null, false);
            }

            User.getUserRoles(userId, function(err, roles) {
                cb(null, !err && roles.indexOf("SiteAdmin") !== -1);
            });
        }
    });

// Add morgan extensions.
morganExtensions(morgan);

// Remove powered by header.
app.disable("x-powered-by");

// Get IP address.
app.use(function(req, res, next) {
    "use strict";

    req.headers.ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    next();
});

// Initialize middleware stack.
app.use(compression());
app.use(morgan(":colorstatus \x1b[30m\x1b[1m:method\x1b[0m :url\x1b[30m\x1b[1m:newline    Date :date[iso]    IP :req[ip]    Time :colorresponse ms"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/files", express.static(path.join(__dirname, "files"), {redirect: false}));
app.use(cookieParser(serverConfig.secret));
app.use(session({
    secret: serverConfig.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post("/api/-/admin/files/upload", upload.single("file0"), function(req, res, next) {
    "use strict";

    next();
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

    res.writeHead(200, {"Content-Type": "image/png", "Cache-Control": "no-store"});
    res.end(captcha.buffer());
});

// Permanent redirects for ModPlug, since we no longer host those files.
app.get(/^\/modplug[\/.*]?/, function(req, res) {
    "use strict";

    res.redirect(301, "http://www.modplug.com");
});

// Permanent redirect for old homepage.
app.get("/tns.asp", function(req, res) {
    "use strict";

    res.redirect(301, "http://roncli.com");
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
if (require.main && (require.main === module || /interceptor\.js$/.test(require.main.filename) && require.main.children[0] === module)) {
    start();
} else {
    console.error("You can only load this website if it is the main script that is executed, or if it is loaded through iisnode.  If iisnode is installed in a non-standard location, you will need to modify the location in the index.js file.");
}

exports.app = app;
