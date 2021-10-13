/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Blog = require("../../src/models/blog"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase;

//  ####    ##                    #    ####    ###
//   #  #    #                   # #   #   #    #
//   #  #    #     ###    ## #  #   #  #   #    #
//   ###     #    #   #  #  #   #   #  ####     #
//   #  #    #    #   #   ##    #####  #        #
//   #  #    #    #   #  #      #   #  #        #
//  ####    ###    ###    ###   #   #  #       ###
//                       #   #
//                        ###
/**
 * A class that handles calls to the blog API.
 */
class BlogAPI extends RouterBase {
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

        route.path = "/api/blog";

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
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async get(req, res) {
        try {
            const category = req.query.category ? `${req.query.category}` : void 0;

            if (req.query.page) {
                const page = +req.query.page;

                if (!isFinite(page) || page < 1 || page % 1 !== 0) {
                    res.status(400).json({error: "Bad request, invalid page number."});
                    return;
                }

                let count;

                if (category && category.length > 0) {
                    count = await Blog.countTitlesByCategory(category);
                } else {
                    count = await Blog.countTitles();
                }

                if (page > Math.ceil(count / Blog.pageSize)) {
                    res.status(404).json({error: "Not found, page does not exist."});
                    return;
                }

                let titles;
                if (category && category.length > 0) {
                    titles = await Blog.getTitlesByCategory(category, page * Blog.pageSize - Blog.pageSize, Blog.pageSize);
                } else {
                    titles = await Blog.getTitles(page * Blog.pageSize - Blog.pageSize, Blog.pageSize);
                }

                res.status(200).json(titles);
                return;
            }

            if (req.query.date) {
                const date = new Date(req.query.date.toString());

                let data;
                if (category && category.length > 0) {
                    data = await Blog.getTitlesByCategoryByDate(category, date);
                } else {
                    data = await Blog.getTitlesByDate(date);
                }

                res.status(200).json(data);
                return;
            }

            res.status(400).json({error: "Bad request, you must include a page or a date."});
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${BlogAPI.route.path}.`, {err});
        }
    }
}

module.exports = BlogAPI;
