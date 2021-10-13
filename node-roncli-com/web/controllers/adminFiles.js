/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminFilesView = require("../../public/views/adminFiles"),
    Common = require("../includes/common"),
    fs = require("fs").promises,
    path = require("path"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #####    #     ##
//   # #       #                       #               #
//  #   #   ## #  ## #    ##    # ##   #       ##      #     ###    ###
//  #   #  #  ##  # # #    #    ##  #  ####     #      #    #   #  #
//  #####  #   #  # # #    #    #   #  #        #      #    #####   ###
//  #   #  #  ##  # # #    #    #   #  #        #      #    #          #
//  #   #   ## #  #   #   ###   #   #  #       ###    ###    ###   ####
/**
 * A class that represents the admin files page.
 */
class AdminFiles extends RouterBase {
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

        route.path = "/admin/files:path((?:/*)?)$";

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
        const user = await User.getCurrent(req);

        if (!user || !await user.is("SiteAdmin")) {
            await Common.notFound(req, res, user);
            return;
        }

        const relativePath = (req.params.path || "").replace(/\/+$/, "");

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
            await Common.notFound(req, res, user);
            return;
        }

        /** @type {{name: string, size: number, date: Date}[]} */
        const entries = [];

        const dir = await fs.opendir(fullPath);
        for await (const entry of dir) {
            /** @type {number} */
            let size = void 0;

            /** @type {Date} */
            let date = void 0;

            if (entry.isFile()) {
                const file = await fs.stat(path.join(fullPath, entry.name));
                size = file.size;
                date = file.mtime;
            }
            entries.push({name: entry.name, size, date});
        }

        entries.sort((a, b) => {
            if (a.size === void 0 && b.size !== void 0) {
                return -1;
            }

            if (a.size !== void 0 && b.size === void 0) {
                return 1;
            }

            return a.name.localeCompare(b.name);
        });

        const data = {
            path: relativePath,
            entries
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: ["/js/adminFiles.js"],
                views: [
                    {
                        name: "AdminFilesView",
                        path: "/views/adminFiles.js"
                    }
                ],
                view: "AdminFilesView",
                jsClass: "AdminFiles",
                data,
                info: data.path
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {js: ["/js/adminFiles.js"]},
                AdminFilesView.get(data),
                AdminFilesView.getInfo(data.path),
                req,
                user
            ));
        }
    }
}

module.exports = AdminFiles;
