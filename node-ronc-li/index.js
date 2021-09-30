const Exception = require("./src/errors/exception"),
    express = require("express"),
    Log = require("node-application-insights-logger"),
    Redirect = require("./src/models/redirect"),
    util = require("util");

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
(function startup() {
    // Setup application insights.
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
        Log.setupApplicationInsights(process.env.APPINSIGHTS_INSTRUMENTATIONKEY, {application: "roncli", container: "roncli-node-roncli-com"});
    }

    Log.info("Starting up...");

    // Set title.
    if (process.platform === "win32") {
        process.title = "ronc.li";
    } else {
        process.stdout.write("\x1b]2;ronc.li\x1b\x5c");
    }

    // Setup express app.
    const app = express();

    // Remove powered by.
    app.disable("x-powered-by");

    // Trust proxy to get correct IP from web server.
    app.enable("trust proxy");

    app.get("*", async (req, res) => {
        try {
            const redirect = await Redirect.getByPath(req.url);

            if (redirect) {
                res.redirect(301, redirect.toUrl);
                return;
            }
        } catch (err) {
            if (err instanceof Exception) {
                Log.error(err.message, {err: err.innerError, req});
            } else {
                Log.error("There was an error while attempting to process a redirect.", {err: new Error(err), req});
            }
        }

        // Catch any redirects that don't exist or threw exceptions.
        res.redirect(301, `https://roncli.com${req.url}`);
    });

    // Startup web server.
    const port = process.env.PORT || 3031;

    app.listen(port);
    Log.info(`Server PID ${process.pid} listening on port ${port}.`);
}());
