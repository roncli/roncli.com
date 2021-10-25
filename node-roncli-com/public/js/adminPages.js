//    #        #           #           ####
//   # #       #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###    ###
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #  #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####   ###
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #          #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###   ####
//                                                   #   #
//                                                    ###
/**
 * A class that handles the admin pages... uh, page.
 */
class AdminPages {
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
        document.getElementById("top-level-page-add").addEventListener("click", async () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("top-level-url")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("top-level-title")).value; // eslint-disable-line no-extra-parens

            if (!url || url === "" || url === "/" || !url.startsWith("/")) {
                await AdminPages.Index.showModal("Invalid URL", "You must enter a valid URL beginning with a slash.");
                return;
            }

            if (!title || title === "") {
                await AdminPages.Index.showModal("Invalid Title", "You must enter a title.");
                return;
            }

            AdminPages.Index.loading(true);

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
                        title
                    })
                });

                if (res.status === 409) {
                    data = await res.json();

                    await AdminPages.Index.showModal("Cannot Add Page", `${data.message}`);

                    AdminPages.Index.loading(false);

                    return;
                } else if (res.status !== 200) {
                    await AdminPages.Index.showModal("Error Occurred", "An error occurred while creating a new top level page.  Please try again.");

                    AdminPages.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminPages.Index.showModal("Error Occurred", "An error occurred while creating a new top level page.  Please try again.");

                AdminPages.Index.loading(false);

                return;
            }

            AdminPages.SPA.loadPage(`/admin/page${data.path}`);
        });

        document.getElementById("top-level-page-move").addEventListener("click", async () => {
            AdminPages.Index.loading(true);

            let data;

            try {
                const movePage = /** @type {HTMLSelectElement} */(document.getElementById("move-page")), // eslint-disable-line no-extra-parens
                    url = movePage.options[movePage.selectedIndex].value;

                const res = await fetch("/api/admin/pages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url
                    })
                });

                if (res.status === 404) {
                    await AdminPages.Index.showModal("Page Does Not Exist", "This page does not exist.");

                    AdminPages.Index.loading(false);

                    return;
                } else if (res.status !== 200) {
                    await AdminPages.Index.showModal("Error Occurred", "An error occurred while making a page a top level page.  Please try again.");

                    AdminPages.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminPages.Index.showModal("Error Occurred", "An error occurred while making a page a top level page.  Please try again.");

                AdminPages.Index.loading(false);

                return;
            }

            document.getElementById("page-html").innerHTML = AdminPages.Template.renderTemplate(data, window.AdminPagesView.get);

            AdminPages.Index.loading(false);

            AdminPages.DOMContentLoaded();
        });

        document.querySelectorAll("button.delete").forEach((b) => b.addEventListener("click", async (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                id = btn.dataset.id; // eslint-disable-line no-extra-parens

            AdminPages.Index.loading(true);

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
                    await AdminPages.Index.showModal("Page Does Not Exist", "This page does not exist.");

                    AdminPages.Index.loading(false);

                    return;
                } else if (res.status === 409) {
                    await AdminPages.Index.showModal("Cannot Delete Page", "This page has children and cannot be deleted.");

                    AdminPages.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminPages.Index.showModal("Error Occurred", "An error occurred while deleting a page.  Please try again.");

                    AdminPages.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminPages.Index.showModal("Error Occurred", "An error occurred while deleting a page.  Please try again.");

                AdminPages.Index.loading(false);

                return;
            }

            btn.closest("div.pill").remove();

            AdminPages.Index.loading(false);
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminPages.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
AdminPages.SPA = typeof SPA === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminPages.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminPages.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminPages = AdminPages;
} else {
    module.exports = AdminPages; // eslint-disable-line no-undef
}
