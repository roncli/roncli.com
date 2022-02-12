//    #        #           #           ####              #    #                          #
//   # #       #                       #   #             #                               #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ##    # ##    ###    ###   ####    ###
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #  ##    #    ##  #  #   #  #   #   #     #
//  #####  #   #  # # #    #    #   #  # #    #####  #   #    #    #      #####  #       #      ###
//  #   #  #  ##  # # #    #    #   #  #  #   #      #  ##    #    #      #      #   #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ###    ###     ##   ####
/**
 * A class that handles the admin redirects page.
 */
class AdminRedirects {
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
        document.querySelectorAll("div#admin-redirects button.delete").forEach((el) => el.addEventListener("click", async () => {
            const id = /** @type {HTMLButtonElement} */(el).dataset.id; // eslint-disable-line no-extra-parens

            AdminRedirects.Index.loading(true);

            try {
                const res = await fetch("/api/admin/redirects", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id
                    })
                });

                if (res.status !== 204) {
                    if (res.status === 404) {
                        await AdminRedirects.Index.showModal("Redirect Not Found", "The redirect does not exist.");
                    } else {
                        await AdminRedirects.Index.showModal("Error Occurred", "An error occurred while deleting a redirect.  Please try again.");
                    }

                    AdminRedirects.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminRedirects.Index.showModal("Error Occurred", "An error occurred while deleting a redirect.  Please try again.");

                AdminRedirects.Index.loading(false);

                return;
            }

            el.closest("div.pill").remove();

            AdminRedirects.Index.loading(false);
        }));

        document.getElementById("add-redirect").addEventListener("click", async () => {
            const fromPath = /** @type {HTMLInputElement} */(document.getElementById("add-redirect-from")).value, // eslint-disable-line no-extra-parens
                toUrl = /** @type {HTMLInputElement} */(document.getElementById("add-redirect-to")).value; // eslint-disable-line no-extra-parens

            AdminRedirects.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/redirects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fromPath,
                        toUrl
                    })
                });

                if (res.status !== 200) {
                    if (res.status === 409) {
                        await AdminRedirects.Index.showModal("Redirect Exists", "A redirect with this redirect from path already exists.  Please rename the redirect from path and try again.");
                    } else {
                        await AdminRedirects.Index.showModal("Error Occurred", "An error occurred while adding a redirect.  Please try again.");
                    }

                    AdminRedirects.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminRedirects.Index.showModal("Error Occurred", "An error occurred while adding a redirect.  Please try again.");

                AdminRedirects.Index.loading(false);

                return;
            }

            document.getElementById("page-html").innerHTML = AdminRedirects.Template.renderTemplate({redirects: data}, window.AdminRedirectsView.get);

            AdminRedirects.Index.loading(false);

            AdminRedirects.DOMContentLoaded();
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminRedirects.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminRedirects.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminRedirects.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminRedirects = AdminRedirects;
} else {
    module.exports = AdminRedirects; // eslint-disable-line no-undef
}
