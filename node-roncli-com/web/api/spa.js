/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    request = require("@root/request"),
    RouterBase = require("hot-router").RouterBase,
    url = require("url");

//   ###   ####     #      #             #
//  #   #  #   #   # #    # #
//  #      #   #  #   #  #   #  # ##    ##
//   ###   ####   #   #  #   #  ##  #    #
//      #  #      #####  #####  ##  #    #
//  #   #  #      #   #  #   #  # ##     #
//   ###   #      #   #  #   #  #       ###
//                              #
//                              #
/**
 * A class that handles calls to the single page application API.
 */
class SPAApi extends RouterBase {
    //                    #
    //                    #
    // ###    ##   #  #  ###    ##
    // #  #  #  #  #  #   #    # ##
    // #     #  #  #  #   #    ##
    // #      ##    ###    ##   ##
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/api/spa";

        return route;
    }

    //                     #
    //                     #
    // ###    ##    ###   ###
    // #  #  #  #  ##      #
    // #  #  #  #    ##    #
    // ###    ##   ###      ##
    // #
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async post(req, res) {
        try {
            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const path = req.body.path,
                dataset = req.body.dataset;

            let querystring = "";

            if (Object.keys(dataset).length > 0) {
                querystring = `?${new url.URLSearchParams(dataset).toString()}`;
            }

            if (!path) {
                res.status(400).json({error: "Bad request, you must send a path."});
                return;
            }

            let localRes = await request.get({
                uri: `http://localhost:${process.env.PORT || 3030}${path}${querystring}`,
                json: true,
                headers: {
                    cookie: req.headers.cookie,
                    "content-type": "application/json"
                },
                followRedirect: false
            });

            if (localRes.statusCode === 301) {
                const newPath = localRes.headers.location;

                localRes = await request.get({
                    uri: `http://localhost:${process.env.PORT || 3030}${newPath}${querystring}`,
                    json: true,
                    headers: {
                        cookie: req.headers.cookie,
                        "content-type": "application/json"
                    },
                    followRedirect: false
                });
            }

            if (localRes.statusCode !== 200) {
                res.status(502).json({error: "Gateway error, could not complete request."});
                return;
            }

            res.status(200).json(localRes.body);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${SPAApi.route.path}.`, {err});
        }
    }
}

module.exports = SPAApi;
