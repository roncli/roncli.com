/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Blog = require("../../src/models/blog"),
    BlogCategoryView = require("../../public/views/blogCategory"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  ####    ##                   ###           #
//   #  #    #                  #   #          #
//   #  #    #     ###    ## #  #       ###   ####    ###    ## #   ###   # ##   #   #
//   ###     #    #   #  #  #   #          #   #     #   #  #  #   #   #  ##  #  #   #
//   #  #    #    #   #   ##    #       ####   #     #####   ##    #   #  #      #  ##
//   #  #    #    #   #  #      #   #  #   #   #  #  #      #      #   #  #       ## #
//  ####    ###    ###    ###    ###    ####    ##    ###    ###    ###   #          #
//                       #   #                              #   #                #   #
//                        ###                                ###                  ###
/**
 * A class that represents the blog category controller.
 */
class BlogCategory extends RouterBase {
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

        route.path = "/blog/category/:category";

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
        const user = await User.getCurrent(req),
            category = req.params.category;

        if (!category || category.length === 0) {
            await Common.notFound(req, res, user);
            return;
        }

        // Get the titles first since we need to load the blog and get the URL of the first post.
        const titles = await Blog.getTitlesByCategory(category, 0, Blog.pageSize);

        if (titles.length === 0) {
            await Common.notFound(req, res, user);
            return;
        }

        const [categories, count] = await Promise.all([Blog.getCategories(), Blog.countTitlesByCategory(category)]);

        let local, newestDate;

        if (titles && titles.length > 0) {
            local = new Date(titles[0].published).toLocaleString("en-US", {hour12: false, year: "numeric", month: "2-digit", day: "2-digit"});
            newestDate = [local.substr(6, 4), local.substr(0, 2), local.substr(3, 2)].join("-");
        }

        const data = {
            category,
            categories,
            titles,
            count,
            pageSize: Blog.pageSize,
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
                        name: "BlogCategoryView",
                        path: "/views/blogCategory.js"
                    }
                ],
                view: "BlogCategoryView",
                jsClass: "Blog",
                data,
                info: {category, categories}
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
                BlogCategoryView.get(data),
                BlogCategoryView.getInfo({category, categories}),
                req,
                user
            ));
        }
    }
}

module.exports = BlogCategory;
