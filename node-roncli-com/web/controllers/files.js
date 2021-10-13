/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    Directory = require("../../src/models/directory"),
    fs = require("fs").promises,
    mime = require("mime"),
    DirectoryView = require("../../public/views/directory"),
    path = require("path"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  #####    #     ##
//  #               #
//  #       ##      #     ###    ###
//  ####     #      #    #   #  #
//  #        #      #    #####   ###
//  #        #      #    #          #
//  #       ###    ###    ###   ####
/**
 * A class that represents the files page, or a file to be downloaded.
 */
class Files extends RouterBase {
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

        route.path = "/files:path((?:/*)?)$";

        return route;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req),
            relativePath = (req.params.path || "").replace(/\/+$/, "");

        // Don't allow relative paths.
        if (relativePath.indexOf("/./") !== -1 || relativePath.endsWith("/.") || relativePath.indexOf("/../") !== -1 || relativePath.endsWith("/..")) {
            await Common.notFound(req, res, user);
            return;
        }

        const fullPath = path.join(__dirname, "../..", "files", relativePath);

        /** @type {import("fs").Stats} */
        let stats;
        try {
            stats = await fs.stat(fullPath);
        } catch (err) {
            await Common.notFound(req, res, user);
            return;
        }

        if (stats.isFile()) {
            res.status(200).contentType(mime.lookup(fullPath)).download(fullPath, path.basename(relativePath));
            return;
        }

        const dir = new Directory(fullPath);

        const data = {
            path: relativePath,
            entries: await dir.get()
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: [],
                views: [
                    {
                        name: "DirectoryView",
                        path: "/views/directory.js"
                    }
                ],
                view: "DirectoryView",
                data,
                info: data.path
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {},
                DirectoryView.get(data),
                DirectoryView.getInfo(data.path),
                req,
                user
            ));
        }
    }
}

module.exports = Files;
