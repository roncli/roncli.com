/**
 * @typedef {import("../../src/models/comment")} Comment
 * @typedef {import("../../types/node/spaTypes").SPAData<any, any>} SPATypes.SPAData
 */

//   ###   ####     #
//  #   #  #   #   # #
//  #      #   #  #   #
//   ###   ####   #   #
//      #  #      #####
//  #   #  #      #   #
//   ###   #      #   #
/**
 * A class that handles the single page application.
 */
class SPA {
    // ##                   #  ###
    //  #                   #  #  #
    //  #     ##    ###   ###  #  #   ###   ###   ##
    //  #    #  #  #  #  #  #  ###   #  #  #  #  # ##
    //  #    #  #  # ##  #  #  #     # ##   ##   ##
    // ###    ##    # #   ###  #      # #  #      ##
    //                                      ###
    /**
     * Loads the specified page.
     * @param {string} path The path of page to load.
     * @param {DOMStringMap} [dataset] The dataset of the element clicked on.
     * @param {boolean} [fromPopstate] Whether this is from the popstate event.
     * @returns {void}
     */
    static loadPage(path, dataset, fromPopstate) {
        if (SPA.onNavigate) {
            SPA.onNavigate();
            SPA.onNavigate = void 0;
        }

        SPA.Index.loading(true);

        // Get the data for the page.
        fetch("/api/spa", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                path,
                dataset
            })
        }).then(async (res) => {
            // Something went wrong, just try to load the page directly.
            if (res.status !== 200) {
                window.location.href = path;
                return;
            }

            /** @type {SPATypes.SPAData} */
            const data = await res.json();

            let promise;

            if (window[data.view]) {
                // Render the page.
                await SPA.renderPage(data.data, data.info, data.view, data.comments);
            } else {
                const head = document.getElementsByTagName("head")[0];

                // Load the required CSS files.
                if (data.css.length > 0) {
                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.type = "text/css";
                    link.href = `/css/?files=${data.css.join(",")}`;
                    head.appendChild(link);
                }

                // Load the required JS files.
                if (data.js.length > 0 && (!data.jsClass || !window[data.jsClass])) {
                    const script = document.createElement("script");
                    promise = new Promise((resolve, reject) => {
                        try {
                            script.onload = resolve;
                        } catch (err) {
                            reject(err);
                        }
                    });
                    script.src = `/js/?files=${data.js.join(",")}`;
                    head.appendChild(script);
                }

                // Load the required templates.
                for (const view of data.views) {
                    if (!window[view.name]) {
                        await SPA.Template.loadTemplate(view.path, view.name);
                    }
                }

                // Render the page.
                await SPA.renderPage(data.data, data.info, data.view, data.comments);
            }

            // Run DOMContentLoaded if it's available on the main class.
            try {
                if (promise) {
                    await promise;
                }

                SPA.onLogin = null;

                if (data.jsClass && window[data.jsClass].DOMContentLoaded) {
                    window[data.jsClass].DOMContentLoaded();

                    if (SPA.onLogin) {
                        SPA.onLogin();
                    }
                }

                if (data.comments) {
                    SPA.Comments.DOMContentLoaded();
                }
            } catch (err) {
                window.location.href = path;
                return;
            }

            // Run timeago on the new page.
            SPA.runTimeago();

            // Update share buttons.
            let share = /** @type {HTMLAnchorElement} */(document.getElementById("share-facebook")); // eslint-disable-line no-extra-parens
            share.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://${window.location.host}${path}`)}`;

            share = /** @type {HTMLAnchorElement} */(document.getElementById("share-tumblr")); // eslint-disable-line no-extra-parens
            share.href = `https://twitter.com/home?status=${encodeURIComponent(`https://${window.location.host}${path}`)}`;

            share = /** @type {HTMLAnchorElement} */(document.getElementById("share-twitter")); // eslint-disable-line no-extra-parens
            share.href = `https://www.tumblr.com/share/link?url=${encodeURIComponent(`https://${window.location.host}${path}`)}`;

            // Update push state.
            if (!fromPopstate) {
                window.history.pushState(dataset, "", path);
            }

            SPA.Index.loading(false);
        }).catch(() => {
            // On error, just follow the link.
            window.location.href = path;
        });
    }

    //                      #              ###
    //                      #              #  #
    // ###    ##   ###    ###   ##   ###   #  #   ###   ###   ##
    // #  #  # ##  #  #  #  #  # ##  #  #  ###   #  #  #  #  # ##
    // #     ##    #  #  #  #  ##    #     #     # ##   ##   ##
    // #      ##   #  #   ###   ##   #     #      # #  #      ##
    //                                                  ###
    /**
     * Renders the page.
     * @param {any} data The data required to render the page.
     * @param {any} info The data required to render the info box.
     * @param {string} view The name of the view.
     * @param {Comment[]} comments The comments to render.
     * @returns {Promise} A promise that resolves when the page is rendered.
     */
    static async renderPage(data, info, view, comments) {
        if (comments) {
            await SPA.Template.loadTemplate("/views/comment/comment.js", "CommentView");
            await SPA.Template.loadTemplate("/views/comment/comments.js", "CommentsView");
            document.getElementById("page-html").innerHTML = `${SPA.Template.renderTemplate(data, window[view].get)}${SPA.Template.renderTemplate({comments}, window.CommentsView.get)}`;
        } else {
            document.getElementById("page-html").innerHTML = SPA.Template.renderTemplate(data, window[view].get);
        }
        document.getElementById("page-info").innerHTML = SPA.Template.renderTemplate(info, window[view].getInfo);

        window.scrollTo(0, 0);
    }

    //                   ###    #
    //                    #
    // ###   #  #  ###    #    ##    # #    ##    ###   ###   ##
    // #  #  #  #  #  #   #     #    ####  # ##  #  #  #  #  #  #
    // #     #  #  #  #   #     #    #  #  ##    # ##   ##   #  #
    // #      ###  #  #   #    ###   #  #   ##    # #  #      ##
    //                                                  ###
    /**
     * Sets up timeago on the page.
     * @returns {void}
     */
    static runTimeago() {
        /** @type {NodeListOf<HTMLTimeElement>} */
        const elements = document.querySelectorAll("time.timeago");

        if (elements.length > 0) {
            elements.forEach((el) => {
                el.title = SPA.Time.formatDate(new Date(el.dateTime));
                el.innerText = SPA.Time.formatDate(new Date(el.dateTime));
            });

            SPA.Timeago.render(elements);

            elements.forEach((el) => {
                el.classList.remove("timeago");
            });
        }
    }

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
        // Run timeago.
        SPA.runTimeago();

        // Setup comments to run timeago.
        SPA.Comments.setupTimeago(SPA.runTimeago);

        // Setup the single page application.
        document.addEventListener("click", (ev) => {
            try {
                let target = /** @type {HTMLElement} */(ev.target); // eslint-disable-line no-extra-parens

                // Only handle anchor tags.
                while (target.nodeName.toLowerCase() !== "a") {
                    if (target.nodeName.toLowerCase() === "button") {
                        return true;
                    }

                    target = /** @type {HTMLElement} */(target.parentNode); // eslint-disable-line no-extra-parens
                    if (!target || !target.classList) {
                        return true;
                    }
                }

                const a = /** @type {HTMLAnchorElement} */(target); // eslint-disable-line no-extra-parens

                // Do not handle download links.
                if (a.classList.contains("download")) {
                    return true;
                }

                // Only handle links that point to local URLs.
                if (!a || !a.getAttribute("href") || !a.getAttribute("href").startsWith("/")) {
                    return true;
                }

                ev.preventDefault();

                SPA.loadPage(a.getAttribute("href"), a.dataset);

                return false;
            } catch (err) {
                // On error, just follow the link.
                return true;
            }
        }, true);
    }

    //                           #           #
    //                           #           #
    // ###    ##   ###    ###   ###    ###  ###    ##
    // #  #  #  #  #  #  ##      #    #  #   #    # ##
    // #  #  #  #  #  #    ##    #    # ##   #    ##
    // ###    ##   ###   ###      ##   # #    ##   ##
    // #           #
    /**
     * Handles the popstate event of the window.
     * @param {PopStateEvent} ev The event.
     * @returns {void}
     */
    static popstate(ev) {
        SPA.loadPage(document.location.pathname, ev.state, true);
    }
}

/** @type {typeof import("./common/comments")} */
// @ts-ignore
SPA.Comments = typeof Comments === "undefined" ? require("./common/comments") : this.Comments; // eslint-disable-line no-undef

/** @type {typeof import("./index")} */
// @ts-ignore
SPA.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {function} */
SPA.onLogin = null;

/** @type {function} */
SPA.onNavigate = null;

/** @type {typeof import("./common/template")} */
// @ts-ignore
SPA.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

/** @type {typeof import("./common/time")} */
// @ts-ignore
SPA.Time = typeof Time === "undefined" ? require("./common/time") : Time; // eslint-disable-line no-undef

/** @type {import("../../node_modules/timeago.js/lib/index")} */
// @ts-ignore
SPA.Timeago = typeof timeago === "undefined" ? require("../../node_modules/timeago.js/lib/index") : timeago; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", SPA.DOMContentLoaded);

window.addEventListener("popstate", SPA.popstate);

if (typeof module === "undefined") {
    window.SPA = SPA;
} else {
    module.exports = SPA; // eslint-disable-line no-undef
}
