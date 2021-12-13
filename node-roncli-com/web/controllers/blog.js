/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const BlogModel = require("../../src/models/blog"),
    BlogView = require("../../public/views/blog"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  ####    ##
//   #  #    #
//   #  #    #     ###    ## #
//   ###     #    #   #  #  #
//   #  #    #    #   #   ##
//   #  #    #    #   #  #
//  ####    ###    ###    ###
//                       #   #
//                        ###
/**
 * A class that represents the blog controller.
 */
class Blog extends RouterBase {
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

        route.path = "/blog";

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
     * @returns {Promise} A promise that resolves when the request has been processed.
     */
    static async get(req, res) {
        // Get the titles first since we need to load the blog and get the URL of the first post.
        const [user, titles] = await Promise.all([User.getCurrent(req), BlogModel.getTitles(0, BlogModel.pageSize)]);

        const [categories, count] = await Promise.all([BlogModel.getCategories(), BlogModel.countTitles()]);

        let local, newestDate;

        if (titles && titles.length > 0) {
            local = new Date(titles[0].published).toLocaleString("en-US", {hour12: false, year: "numeric", month: "2-digit", day: "2-digit"});
            newestDate = [local.substr(6, 4), local.substr(0, 2), local.substr(3, 2)].join("-");
        }

        const data = {
            titles,
            categories,
            count,
            pageSize: BlogModel.pageSize,
            newestDate
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Blog - roncli.com",
                css: ["/css/blog.css"],
                js: ["/js/blog.js"],
                views: [
                    {
                        name: "BlogTitlesView",
                        path: "/views/blog/titles.js"
                    },
                    {
                        name: "PaginationPageView",
                        path: "/views/pagination/page.js"
                    },
                    {
                        name: "BlogView",
                        path: "/views/blog.js"
                    }
                ],
                view: "BlogView",
                jsClass: "Blog",
                data,
                info: {categories}
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Blog - roncli.com</title>
                    <meta name="og:description" content="The roncli.com blog." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Blog" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="The roncli.com blog." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Blog" />
                `,
                void 0,
                {
                    css: ["/css/blog.css"],
                    js: ["/views/blog/titles.js", "/views/pagination/page.js", "/js/blog.js"]
                },
                BlogView.get(data),
                BlogView.getInfo({categories}),
                req,
                user
            ));
        }
    }
}

module.exports = Blog;
