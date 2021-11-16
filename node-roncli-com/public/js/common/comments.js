//   ###                                       #
//  #   #                                      #
//  #       ###   ## #   ## #    ###   # ##   ####    ###
//  #      #   #  # # #  # # #  #   #  ##  #   #     #
//  #      #   #  # # #  # # #  #####  #   #   #      ###
//  #   #  #   #  # # #  # # #  #      #   #   #  #      #
//   ###    ###   #   #  #   #   ###   #   #    ##   ####
/**
 * A class of functions to handle the comments section of each page.
 */
class Comments {
    //                   #  #   #       #               #
    //                   #  #           #               #
    // ###   #  #  ###   #  #  ##     ###   ###   ##   ###    ###
    // #  #  #  #  #  #  ####   #    #  #  #  #  # ##   #    ##
    // #     #  #  #  #  ####   #    #  #   ##   ##     #      ##
    // #      ###  #  #  #  #  ###    ###  #      ##     ##  ###
    //                                      ###
    /**
     * Sets up the function to call when we want to setup widgets.
     * @param {Function} fx The function to run when we want to setup widgets.
     * @returns {void}
     */
    static runWidgets(fx) {
        Comments.setupWidgets = fx;
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
        if (!document.getElementById("comment-editor")) {
            return;
        }

        Comments.Quote.prototype.render = function() {
            // @ts-ignore
            var e = this._make("blockquote", [this.CSS.baseClass, this.CSS.wrapper]),
                // @ts-ignore
                t = this._make("div", [this.CSS.input, this.CSS.text], {
                    // @ts-ignore
                    contentEditable: !this.readOnly,
                    // @ts-ignore
                    innerHTML: this.data.text
                }),
                // @ts-ignore
                n = this._make("div", [this.CSS.input, this.CSS.caption], {
                    // @ts-ignore
                    contentEditable: !this.readOnly,
                    // @ts-ignore
                    innerHTML: this.data.caption
                });
            // @ts-ignore
            return t.dataset.placeholder = this.quotePlaceholder, n.dataset.placeholder = this.captionPlaceholder, e.appendChild(n), e.appendChild(t), e; // eslint-disable-line no-sequences
        };

        Object.defineProperty(Comments.Quote, "sanitize", {get: () => ({
            text: {
                br: {},
                a: {href: true},
                b: {},
                i: {},
                p: {},
                blockquote: {},
                div: {}
            },
            caption: {
                br: {}
            },
            alignment: {}
        })});

        Comments.editor = new Comments.EditorJS({
            holder: "comment-editor",
            minHeight: 20,
            tools: {
                quote: {
                    class: Comments.Quote,
                    toolbox: false
                }
            }
        });

        if (document.getElementById("comments")) {
            document.getElementById("comments").addEventListener("click", (ev) => {
                let el = /** @type {HTMLElement} */(ev.target); // eslint-disable-line no-extra-parens

                while (!el.classList.contains("comment-reply")) {
                    el = /** @type {HTMLElement} */(el.parentNode); // eslint-disable-line no-extra-parens
                    if (!el || !el.classList) {
                        return;
                    }
                }

                const comment = /** @type {HTMLButtonElement} */(ev.target).closest("div.comment"), // eslint-disable-line no-extra-parens
                    username = /** @type {HTMLDivElement} */(comment.querySelector("span.comment-username")).innerText, // eslint-disable-line no-extra-parens
                    date = /** @type {HTMLTimeElement} */(comment.querySelector("time")).dateTime, // eslint-disable-line no-extra-parens
                    text = /** @type {HTMLDivElement} */(comment.querySelector("div.comment-text")).innerHTML, // eslint-disable-line no-extra-parens
                    caption = `On ${new Date(date).toLocaleString("en-us", {month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"})}, ${username} wrote:`;

                Comments.editor.blocks.insert("quote", {text, caption});
            });
        }

        document.getElementById("comment-post").addEventListener("click", async () => {
            if (!Comments.Index.user) {
                await Comments.Index.showModal("Please Log In", "You must log in before posting a comment.");
                return;
            }

            /** @type {HTMLButtonElement} */(document.getElementById("comment-post")).disabled = true; // eslint-disable-line no-extra-parens
            for (const el of Array.from(document.getElementsByClassName("comment-reply"))) {
                /** @type {HTMLButtonElement} */(el).disabled = true; // eslint-disable-line no-extra-parens
            }

            try {
                const data = await Comments.editor.save();

                await Comments.editor.readOnly.toggle(true);

                let comment;

                try {
                    // Save comment.
                    const res = await fetch("/api/comment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            url: window.location.pathname,
                            data
                        })
                    });

                    if (res.status !== 200) {
                        await Comments.Index.showModal("Error Posting Comment", "An error occurred while posting a comment.  Please reload the page and try again.");
                        return;
                    }

                    comment = await res.json();
                } catch (err) {
                    await Comments.Index.showModal("Error Posting Comment", "An error occurred while posting a comment.  Please reload the page and try again.");

                    return;
                }

                await Comments.Template.loadTemplate("/views/comment/comment.js", "CommentView");

                const html = window.CommentView.get(comment);

                document.getElementById("comments").insertAdjacentHTML("beforeend", html);

                if (Comments.setupWidgets) {
                    await Comments.setupWidgets();
                }

                await Comments.editor.readOnly.toggle(false);

                Comments.editor.blocks.clear();
            } catch (err) {
                await Comments.Index.showModal("Error Posting Comment", "An error occurred while posting a comment.  Please reload the page and try again.");
            } finally {
                await Comments.editor.readOnly.toggle(false);

                for (const el of Array.from(document.getElementsByClassName("comment-reply"))) {
                    /** @type {HTMLButtonElement} */(el).disabled = false; // eslint-disable-line no-extra-parens
                }

                /** @type {HTMLButtonElement} */(document.getElementById("comment-post")).disabled = false; // eslint-disable-line no-extra-parens
            }
        });
    }
}

Comments.editor = null;

/** @type {typeof import("../../../node_modules/@editorjs/editorjs/types/index").default} */
// @ts-ignore
Comments.EditorJS = typeof EditorJS === "undefined" ? require("../../../node_modules/@editorjs/editorjs/types/index").default : EditorJS; // eslint-disable-line no-undef

/** @type {typeof import("../index")} */
// @ts-ignore
Comments.Index = typeof Index === "undefined" ? require("../index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("../../js/common/modal")} */
// @ts-ignore
Comments.Modal = typeof Modal === "undefined" ? require("../../js/common/modal") : Modal; // eslint-disable-line no-undef

/** @type {import("../../js/common/modal")} */
Comments.modal = null;

/** @type {typeof import("../../../node_modules/@editorjs/quote/dist/bundle")} */
// @ts-ignore
Comments.Quote = typeof Quote === "undefined" ? require("../../../node_modules/@editorjs/quote/dist/bundle") : Quote; // eslint-disable-line no-undef

/** @type {Function} */
Comments.setupWidgets = null;

/** @type {typeof import("../../js/common/template")} */
// @ts-ignore
Comments.Template = typeof Template === "undefined" ? require("../../js/common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", Comments.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Comments = Comments;
} else {
    module.exports = Comments; // eslint-disable-line no-undef
}
