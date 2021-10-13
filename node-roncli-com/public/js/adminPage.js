//    #        #           #           ####
//   # #       #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###
//                                                   #   #
//                                                    ###
/**
 * A class that handles the admin page... uh, page.
 */
class AdminPage {
    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page.
     * @returns {Promise} A promise that resolves when the page has been setup.
     */
    static async DOMContentLoaded() {
        // Setup HTML editor.
        await AdminPage.Template.loadTemplate("/js/monaco-editor/vs/loader.js", "require");

        window.require.config({paths: {vs: "/js/monaco-editor/vs"}});
        window.require(["vs/editor/editor.main"], () => {
            const el = document.getElementById("html"),
                html = el.dataset.html;

            el.removeAttribute("data-html");

            document.getElementById("preview").innerHTML = html;

            AdminPage.editor = window.monaco.editor.create(el, {
                value: html,
                language: "html",
                theme: "vs-dark",
                fontFamily: "'FixedsysExcelsiorIIIb Nerd Font', Consolas, 'Courier New', monospace",
                fontSize: 16,
                lineHeight: 16
            });

            AdminPage.SPA.onNavigate = () => {
                AdminPage.previewTimeout = void 0;
                AdminPage.editor.dispose();
                AdminPage.editor = void 0;
            };

            AdminPage.editor.onDidChangeModelContent(() => {
                if (AdminPage.previewTimeout) {
                    clearTimeout(AdminPage.previewTimeout);
                    AdminPage.previewTimeout = void 0;
                }

                AdminPage.previewTimeout = setTimeout(() => {
                    if (AdminPage.editor) {
                        document.getElementById("preview").innerHTML = AdminPage.editor.getValue();
                    }
                }, 1000);
            });
        });

        AdminPage.Sortable.create(document.getElementById("child-pages"), {
            store: {
                get: () => [],
                set: async (sortable) => {
                    try {
                        const res = await fetch("/api/admin/page", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                url: document.getElementById("page-url").innerText,
                                order: sortable.toArray()
                            })
                        });

                        if (res.status !== 204) {
                            await AdminPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                        }
                    } catch (err) {
                        await AdminPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                    }
                }
            }
        });

        document.getElementById("child-page-add").addEventListener("click", async (ev) => {
            const childPageAdd = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                parentPageId = childPageAdd.dataset.parent,
                url = /** @type {HTMLInputElement} */(document.getElementById("child-url")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("child-title")).value; // eslint-disable-line no-extra-parens

            if (!url || url === "" || url === "/" || !url.startsWith("/")) {
                await AdminPage.Index.showModal("Invalid URL", "You must enter a valid URL beginning with a slash.");
                return;
            }

            if (!title || title === "") {
                await AdminPage.Index.showModal("Invalid Title", "You must enter a title.");
                return;
            }

            AdminPage.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/pages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        create: true,
                        url,
                        parentPageId,
                        title
                    })
                });

                if (res.status === 409) {
                    data = await res.json();

                    await AdminPage.Index.showModal("Cannot Add Page", `${data.message}.`);

                    AdminPage.Index.loading(false);

                    return;
                } else if (res.status !== 200) {
                    await AdminPage.Index.showModal("Error Occurred", "An error occurred while creating a new child page.  Please try again.");

                    AdminPage.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminPage.Index.showModal("Error Occurred", "An error occurred while creating a new child page.  Please try again.");

                AdminPage.Index.loading(false);

                return;
            }

            AdminPage.SPA.loadPage(`/admin/page${data.path}`);
        });

        document.getElementById("child-page-move").addEventListener("click", async (ev) => {
            const childPageMove = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                parentPageId = childPageMove.dataset.parent,
                movePage = /** @type {HTMLSelectElement} */(document.getElementById("move-page")), // eslint-disable-line no-extra-parens
                url = movePage.options[movePage.selectedIndex].value;

            AdminPage.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/pages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url,
                        parentPageId
                    })
                });

                if (res.status === 404) {
                    data = await res.json();

                    await AdminPage.Index.showModal("Page Does Not Exist", "This page does not exist.");

                    AdminPage.Index.loading(false);

                    return;
                } else if (res.status !== 200) {
                    await AdminPage.Index.showModal("Error Occurred", "An error occurred while making a page a child of this page.  Please try again.");

                    AdminPage.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminPage.Index.showModal("Error Occurred", "An error occurred while making a page a child of this page.  Please try again.");

                AdminPage.Index.loading(false);

                return;
            }

            document.getElementById("page-html").innerHTML = AdminPage.Template.renderTemplate(data, window.AdminPageView.get);

            AdminPage.Index.loading(false);

            AdminPage.DOMContentLoaded();
        });

        document.querySelectorAll("button.delete").forEach((b) => b.addEventListener("click", async (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                id = btn.dataset.id; // eslint-disable-line no-extra-parens

            AdminPage.Index.loading(true);

            try {
                const res = await fetch("/api/admin/page", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id
                    })
                });

                if (res.status === 404) {
                    await AdminPage.Index.showModal("Page Does Not Exist", "This page does not exist.");

                    AdminPage.Index.loading(false);

                    return;
                } else if (res.status === 409) {
                    await AdminPage.Index.showModal("Cannot Delete Page", "This page has children and cannot be deleted.");

                    AdminPage.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminPage.Index.showModal("Error Occurred", "An error occurred while deleting a page.  Please try again.");

                    AdminPage.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminPage.Index.showModal("Error Occurred", "An error occurred while deleting a page.  Please try again.");

                AdminPage.Index.loading(false);

                return;
            }

            btn.closest("div.pill").remove();

            AdminPage.Index.loading(false);
        }));

        document.getElementById("save-page").addEventListener("click", async () => {
            const html = AdminPage.editor.getValue();

            AdminPage.Index.loading(true);

            try {
                const res = await fetch("/api/admin/page", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: document.getElementById("page-url").innerText,
                        page: html
                    })
                });

                if (res.status === 404) {
                    await AdminPage.Index.showModal("Page Does Not Exist", "This page does not exist.");

                    AdminPage.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminPage.Index.showModal("Error Occurred", "An error occurred while saving the page.  Please try again.");

                    AdminPage.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminPage.Index.showModal("Error Occurred", "An error occurred while saving the page.  Please try again.");

                AdminPage.Index.loading(false);

                return;
            }

            AdminPage.Index.loading(false);
        });

        document.getElementById("page-update").addEventListener("click", async () => {
            const title = /** @type {HTMLInputElement} */(document.getElementById("page-title")).value, // eslint-disable-line no-extra-parens
                shortTitle = /** @type {HTMLInputElement} */(document.getElementById("page-short-title")).value; // eslint-disable-line no-extra-parens

            AdminPage.Index.loading(true);

            try {
                const res = await fetch("/api/admin/page", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: document.getElementById("page-url").innerText,
                        title,
                        shortTitle
                    })
                });

                if (res.status === 404) {
                    await AdminPage.Index.showModal("Page Does Not Exist", "This page does not exist.");

                    AdminPage.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminPage.Index.showModal("Error Occurred", "An error occurred while saving the page.  Please try again.");

                    AdminPage.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminPage.Index.showModal("Error Occurred", "An error occurred while saving the page.  Please try again.");

                AdminPage.Index.loading(false);

                return;
            }

            document.querySelectorAll(".info-short-title").forEach((/** @type {HTMLElement} */d) => d.innerText = shortTitle);

            AdminPage.Index.loading(false);
        });

        document.getElementById("fullscreen").addEventListener("click", () => {
            document.getElementById("html").classList.toggle("fullscreen");
            document.getElementById("fullscreen").classList.toggle("fullscreen");
            document.body.classList.toggle("fullscreen");
            if (document.body.classList.contains("fullscreen")) {
                window.scrollTo(0, 0);
            }
            AdminPage.editor.layout();
        });
    }
}

AdminPage.editor = null;

/** @type {NodeJS.Timeout} */
AdminPage.previewTimeout = null;

/** @type {typeof import("./index")} */
// @ts-ignore
AdminPage.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("../../node_modules/@types/sortablejs")} */
// @ts-ignore
AdminPage.Sortable = typeof Sortable === "undefined" ? require("../../node_modules/sortablejs/Sortable") : Sortable; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
AdminPage.SPA = typeof SPA === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminPage.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminPage.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminPage = AdminPage;
} else {
    module.exports = AdminPage; // eslint-disable-line no-undef
}
