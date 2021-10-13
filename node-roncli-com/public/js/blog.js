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
 * A class that handles the blog page.
 */
class Blog {
    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page.
     * @returns {void}
     */
    static DOMContentLoaded() {
        const btn = document.getElementById("toggle-top");

        btn.addEventListener("click", () => {
            const div = document.getElementById("tag-cloud");

            div.classList.toggle("top-only");

            if (div.classList.contains("top-only")) {
                btn.innerText = "⏬ Show More";
            } else {
                btn.innerText = "⏫ Show Less";
            }
        });

        document.querySelectorAll("div#blog-pagination a.page").forEach((/** @type {HTMLAnchorElement} */el) => el.addEventListener("click", async (ev) => {
            ev.preventDefault();

            const category = document.getElementById("blog-pagination").dataset.category,
                page = +el.dataset.page;

            Blog.Index.loading(true);

            let data;

            try {
                const res = await fetch(`/api/blog?page=${page}${category ? `&category=${category}` : ""}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.status !== 200) {
                    await Blog.Index.showModal("Error Occurred", "An error occurred while loading the list of blog posts.  Please try again.");

                    Blog.Index.loading(false);

                    return false;
                }

                data = await res.json();
            } catch (err) {
                await Blog.Index.showModal("Error Occurred", "An error occurred while loading the list of blog posts.  Please try again.");

                Blog.Index.loading(false);

                return false;
            }

            document.getElementById("blog-titles").innerHTML = window.BlogTitlesView.get(data);

            const blogPagination = document.getElementById("blog-pagination");

            blogPagination.innerHTML = window.PaginationPageView.get({page, total: +blogPagination.dataset.total});

            Blog.Index.loading(false);

            Blog.DOMContentLoaded();

            Blog.SPA.runTimeago();

            return false;
        }));

        document.getElementById("blog-date").addEventListener("change", async () => {
            const category = document.getElementById("blog-date").dataset.category,
                date = /** @type {HTMLInputElement} */(document.getElementById("blog-date")).value; // eslint-disable-line no-extra-parens

            Blog.Index.loading(true);

            let data;

            try {
                const res = await fetch(`/api/blog?date=${date}${category ? `&category=${category}` : ""}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.status !== 200) {
                    await Blog.Index.showModal("Error Occurred", "An error occurred while loading the list of blog posts.  Please try again.");

                    Blog.Index.loading(false);

                    return false;
                }

                data = await res.json();
            } catch (err) {
                await Blog.Index.showModal("Error Occurred", "An error occurred while loading the list of blog posts.  Please try again.");

                Blog.Index.loading(false);

                return false;
            }

            document.getElementById("blog-titles").innerHTML = window.BlogTitlesView.get(data.titles);

            const blogPagination = document.getElementById("blog-pagination");

            blogPagination.innerHTML = window.PaginationPageView.get({page: data.page, total: +blogPagination.dataset.total});

            Blog.Index.loading(false);

            Blog.DOMContentLoaded();

            Blog.SPA.runTimeago();

            return false;
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
Blog.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
Blog.SPA = typeof Template === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
Blog.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", Blog.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Blog = Blog;
} else {
    module.exports = Blog; // eslint-disable-line no-undef
}
