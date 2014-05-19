var express = require('express'),
    rendr = require('rendr'),
    app = express(),
    ApiDataAdapter = require("./server/ApiDataAdapter"),
    server = rendr.createServer({
        dataAdapter: new ApiDataAdapter()
    });

// Initialize Express middleware stack.
app.use(express.compress());
app.use(express.static(__dirname + '/public'));
app.use(server);

/**
 * Start the Express server.
 */
function start() {
    "use strict";

    var port = process.env.PORT || 3030;
    app.listen(port);
    console.log("server pid %s listening on port %s in %s mode", process.pid, port, app.get('env'));
}

// Only start server if this script is executed, and not called via require.
if (require.main === module) {
    start();
}

exports.app = app;
