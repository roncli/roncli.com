/// <reference path="../../typings/node/node.d.ts"/>
module.exports = function(morgan) {
    "use strict";

    // colorstatus - Returns the status number in color.
    morgan.token("colorstatus", function(req, res) {
        // Default to green.
        var color = 32,
            status = res.statusCode;

        if (!res._header) {
            return null;
        }

        if (status >= 500) {
            // 5xx is red.
            color = 31;
        } else if (status >= 400) {
            // 4xx is yellow.
            color = 33;
        } else if (status >= 300) {
            // 3xx is cyan.
            color = 36;
        }

        return "\x1b[" + color + "m\x1b[1m" + res.statusCode + "\x1b[0m";
    });

    // colorresponse - Returns the response time in color.
    morgan.token("colorresponse", function(req, res) {
        // Default to green.
        var color = 32,
            diff, ms;

        // Ensure we have the data to proceed.
        if (!res._header || !req._startAt) {
            return "";
        }

        // Calculate the response time.
        diff = process.hrtime(req._startAt);
        ms = diff[0] * 1e3 + diff[1] * 1e-6;

        if (ms >= 1000) {
            // 1s or greater is red.
            color = 31;
        } else if (ms >= 100) {
            // 100ms to 1s is yellow.
            color = 33;
        } else if (ms >= 10) {
            // 10ms to 100ms is cyan.
            color = 36;
        }

        return "\x1b[" + color + "m\x1b[1m" + ms.toFixed(3) + "\x1b[0m";
    });

    // newline - Simple newline.
    morgan.token("newline", function() {
        return "\n";
    });
};
