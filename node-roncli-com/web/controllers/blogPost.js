/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Blog = require("../../src/models/blog"),
    BlogPostView = require("../../public/views/blogPost"),
    Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    Encoding = require("../../public/js/common/encoding"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");


//  ####    ##                  ####                  #
//   #  #    #                  #   #                 #
//   #  #    #     ###    ## #  #   #   ###    ###   ####
//   ###     #    #   #  #  #   ####   #   #  #       #
//   #  #    #    #   #   ##    #      #   #   ###    #
//   #  #    #    #   #  #      #      #   #      #   #  #
//  ####    ###    ###    ###   #       ###   ####     ##
//                       #   #
//                        ###
/**
 * A class that represents the blog post controller.
 */
class BlogPost extends RouterBase {
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

        route.path = "/:source((?:blogger|tumblr))/:id/:path";

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
        const user = await User.getCurrent(req);

        /** @type {string} */
        let category = void 0;

        if (req.headers["content-type"] === "application/json") {
            if (req.query && req.query.category) {
                category = `${req.query.category}`;
            }
        }

        const path = `/${req.params.source}/${req.params.id}/${req.params.path}`,
            post = await Blog.getPostByUrl(path);

        if (!post) {
            await Common.notFound(req, res, user);
            return;
        }

        const [categories, comments] = await Promise.all([Blog.getCategories(), Comment.getByUrl(path, user)]);

        if (post.comments) {
            comments.push(...post.comments.map((c) => new Comment({
                _id: void 0,
                url: path,
                comment: c.content,
                dateAdded: new Date(c.published),
                userId: void 0,
                username: c.author.displayName,
                dateModerated: new Date(c.published)
            })));
        }

        comments.sort((a, b) => a.dateAdded.getTime() - b.dateAdded.getTime());

        const data = {
            title: post.post,
            content: post.content,
            mainNav: post.mainNav,
            categoryNavs: post.categoryNavs,
            category
        };

        const info = {
            title: post.post,
            category,
            categories
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: `${post.post.title} - Blog - roncli.com`,
                css: ["/css/blogPost.css"],
                js: [],
                views: [
                    {
                        name: "BlogContentView",
                        path: "/views/blog/content.js"
                    },
                    {
                        name: "BlogPostView",
                        path: "/views/blogPost.js"
                    }
                ],
                view: "BlogPostView",
                comments,
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>${Encoding.htmlEncode(post.post.title)} - Blog - roncli.com</title>
                    <meta name="article:author" content="https://www.facebook.com/roncli" />
                    <meta name="article:publisher" content="https://www.facebook.com/roncli" />
                    <meta name="article:published_time" content="${new Date(post.post.published).toISOString()}" />
                    <meta name="article:section" content="Blog" />
                    ${post.post.categories.map((c) => /* html */`
                        <meta name="article:tag" content="${Encoding.attributeEncode(c)}" />
                    `).join("")}
                    <meta name="og:description" content="Read the post &quot;${Encoding.attributeEncode(post.post.title)}&quot; on the roncli.com blog." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="${Encoding.attributeEncode(post.post.title)}" />
                    <meta name="og:type" content="article" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Read the post &quot;${Encoding.attributeEncode(post.post.title)}&quot; on the roncli.com blog." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="${Encoding.attributeEncode(post.post.title)}" />
                `,
                comments,
                {
                    css: ["/css/blogPost.css"],
                    js: ["/views/blog/content.js"]
                },
                BlogPostView.get(data),
                BlogPostView.getInfo(info),
                req,
                user
            ));
        }
    }
}

module.exports = BlogPost;
