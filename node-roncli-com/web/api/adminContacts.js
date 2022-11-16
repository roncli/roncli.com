/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Contact = require("../../src/models/contact"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #            ###                  #                    #              #    ####    ###
//   # #       #                       #   #                 #                    #             # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #       ###   # ##   ####    ###    ###   ####    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  #      #   #  ##  #   #         #  #   #   #     #      #   #  ####     #
//  #####  #   #  # # #    #    #   #  #      #   #  #   #   #      ####  #       #      ###   #####  #        #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #   #  #  #   #  #   #   #  #      #  #   #  #        #
//  #   #   ## #  #   #   ###   #   #   ###    ###   #   #    ##    ####   ###     ##   ####   #   #  #       ###
/**
 * A class that handles calls to the admin contacts API.
 */
class AdminContactsAPI extends RouterBase {
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

        route.path = "/api/admin/contacts";

        return route;
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async delete(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const id = req.body.id;

            if (!id) {
                res.status(400).json({error: "Bad request, invalid ID."});
                return;
            }

            const contact = await Contact.get(id);

            if (!contact) {
                res.status(404).json({error: "Not found, contact does not exist."});
                return;
            }

            await contact.delete();

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminContactsAPI.route.path}.`, {err});
        }
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
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            if (!req.body.url) {
                res.status(400).json({error: "Bad request, you must include a URL."});
                return;
            }

            if (!req.body.title) {
                res.status(400).json({error: "Bad request, you must include a title."});
                return;
            }

            let existing = await Contact.getByValue(req.body.url);

            if (existing) {
                res.status(409).json({error: "Conflict, contact already exists.", message: "This contact URL already exists."});
                return;
            }

            existing = await Contact.getByTitle(req.body.title);

            if (existing) {
                res.status(409).json({error: "Conflict, contact already exists.", message: "This contact title already exists."});
                return;
            }

            const contact = new Contact({
                value: req.body.url,
                title: req.body.title
            });

            await contact.add();

            res.status(204).json();
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminContactsAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminContactsAPI;
