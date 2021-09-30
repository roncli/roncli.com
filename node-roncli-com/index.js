const Cache = require("node-redis").Cache,
    CacheData = require("./src/cacheData"),
    compression = require("compression"),
    connectRedis = require("connect-redis"),
    cookieParser = require("cookie-parser"),
    express = require("express"),
    expressSession = require("express-session"),
    fs = require("fs").promises,
    HotRouter = require("hot-router"),
    Log = require("node-application-insights-logger"),
    Minify = require("node-minify"),
    path = require("path"),
    Redis = require("node-redis"),
    util = require("util"),

    Redirects = require("./src/redirects");

process.on("unhandledRejection", (reason) => {
    Log.error("Unhandled promise rejection caught.", {err: reason instanceof Error ? reason : new Error(util.inspect(reason))});
});

//         #                 #
//         #                 #
//  ###   ###    ###  ###   ###   #  #  ###
// ##      #    #  #  #  #   #    #  #  #  #
//   ##    #    # ##  #      #    #  #  #  #
// ###      ##   # #  #       ##   ###  ###
//                                      #
/**
 * Starts up the application.
 */
(async function startup() {
    // Setup application insights.
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
        Log.setupApplicationInsights(process.env.APPINSIGHTS_INSTRUMENTATIONKEY, {application: "roncli", container: "roncli-node-roncli-com"});
    }

    Log.info("Starting up...");

    // Set title.
    if (process.platform === "win32") {
        process.title = "roncli.com";
    } else {
        process.stdout.write("\x1b]2;roncli.com\x1b\x5c");
    }

    // Setup Redis.
    Redis.setup({
        host: "redis",
        port: +process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    });
    Redis.eventEmitter.on("error", (err) => {
        Log.error(`Redis error: ${err.message}`, {err: err.err});
    });
    await Cache.flush();

    // Setup express app.
    const app = express();

    // Remove powered by.
    app.disable("x-powered-by");

    // Initialize middleware stack.
    app.use(express.json());
    app.use(compression());
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.use(expressSession({
        store: new (connectRedis(expressSession))({
            client: await Redis.getClient(),
            prefix: `${process.env.REDIS_PREFIX}:sess:`,
            ttl: 86400
        }),
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false
    }));

    // Trust proxy to get correct IP from web server.
    app.enable("trust proxy");

    // Setup public redirects.
    app.use(/^(?!\/tsconfig\.json)/, express.static("public"));

    // Setup minification.
    Minify.setup({
        cssRoot: "/css/",
        jsRoot: "/js/",
        wwwRoot: path.join(__dirname, "public"),
        caching: process.env.MINIFY_CACHE ? {
            get: async (key) => {
                try {
                    return await Cache.get(key);
                } catch (err) {
                    Log.error("An error occurred while attempting to get a Minify cache.", {err, properties: {key}});
                    return void 0;
                }
            },
            set: (key, value) => {
                Cache.add(key, value).catch((err) => {
                    Log.error("An error occurred while attempting to set a Minify cache.", {err, properties: {key}});
                });
            },
            prefix: process.env.REDIS_PREFIX
        } : void 0,
        redirects: Redirects,
        disableTagCombining: !process.env.MINIFY_ENABLED
    });
    app.get("/css", Minify.cssHandler);
    app.get("/js", Minify.jsHandler);

    // Setup redirect routes.
    app.get("*", async (req, res, next) => {
        const redirect = Redirects[req.path.split("?").shift()];
        if (!redirect) {
            next();
            return;
        }

        if (redirect.replace) {
            let data = await fs.readFile(redirect.path, "utf8");

            for (const find of Object.keys(redirect.replace)) {
                data = data.split(find).join(redirect.replace[find]);
            }

            res.status(200).contentType(redirect.contentType).send(data);
        } else {
            res.status(200).contentType(redirect.contentType).sendFile(redirect.path);
        }
    });

    // Add autoplay header.
    app.use((req, res, next) => {
        res.set("Feature-Policy", "autoplay https://www.youtube.com https://w.soundcloud.com");
        next();
    });

    // Setup hot-router.
    const router = new HotRouter.Router();
    router.on("error", (data) => {
        Log.error(data.message, {err: data.err, req: data.req});
    });
    try {
        app.use("/", await router.getRouter(path.join(__dirname, "web"), {hot: false}));
    } catch (err) {
        Log.critical("Could not set up routes.", {err});
    }

    app.use((err, req, res, next) => {
        router.error(err, req, res, next);
    });

    // Startup web server.
    const port = process.env.PORT || 3030;

    // Start caching data.
    setTimeout(CacheData.checkCache, 1);

    app.listen(port);
    Log.info(`Server PID ${process.pid} listening on port ${port}.`);
}());
