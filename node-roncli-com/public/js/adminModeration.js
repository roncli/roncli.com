//    #        #           #           #   #             #                        #       #
//   # #       #                       #   #             #                        #
//  #   #   ## #  ## #    ##    # ##   ## ##   ###    ## #   ###   # ##    ###   ####    ##     ###   # ##
//  #   #  #  ##  # # #    #    ##  #  # # #  #   #  #  ##  #   #  ##  #      #   #       #    #   #  ##  #
//  #####  #   #  # # #    #    #   #  #   #  #   #  #   #  #####  #       ####   #       #    #   #  #   #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #  ##  #      #      #   #   #  #    #    #   #  #   #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ####    ##    ###    ###   #   #
/**
 * A class that handles the admin moderation page.
 */
class AdminModeration {
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
        document.querySelectorAll("div#comments button.comment-accept").forEach((b) => b.addEventListener("click", async (ev) => {
            const id = /** @type {HTMLButtonElement} */(ev.target).dataset.id; // eslint-disable-line no-extra-parens

            AdminModeration.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/moderation", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id
                    })
                });

                if (res.status !== 200) {
                    await AdminModeration.Index.showModal("Error Occurred", "An error occurred while accepting a comment.  Please try again.");

                    AdminModeration.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                console.log(err);

                await AdminModeration.Index.showModal("Error Occurred", "An error occurred while accepting a comment.  Please try again.");

                AdminModeration.Index.loading(false);

                return;
            }

            document.getElementById("page-html").innerHTML = AdminModeration.Template.renderTemplate({comments: data}, window.AdminModerationView.get);

            AdminModeration.Index.loading(false);

            AdminModeration.DOMContentLoaded();
        }));

        document.querySelectorAll("div#comments button.comment-reject").forEach((b) => b.addEventListener("click", async (ev) => {
            const id = /** @type {HTMLButtonElement} */(ev.target).dataset.id; // eslint-disable-line no-extra-parens

            AdminModeration.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/moderation", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id
                    })
                });

                if (res.status !== 200) {
                    await AdminModeration.Index.showModal("Error Occurred", "An error occurred while rejecting a comment.  Please try again.");

                    AdminModeration.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                console.log(err);

                await AdminModeration.Index.showModal("Error Occurred", "An error occurred while rejecting a comment.  Please try again.");

                AdminModeration.Index.loading(false);

                return;
            }

            document.getElementById("page-html").innerHTML = AdminModeration.Template.renderTemplate({comments: data}, window.AdminModerationView.get);

            AdminModeration.Index.loading(false);

            AdminModeration.DOMContentLoaded();
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminModeration.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminModeration.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminModeration.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminModeration = AdminModeration;
} else {
    module.exports = AdminModeration; // eslint-disable-line no-undef
}
