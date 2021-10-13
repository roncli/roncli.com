//    #        #           #            ###                 #
//   # #       #                       #   #                #
//  #   #   ## #  ## #    ##    # ##   #       ###    ###   # ##    ###
//  #   #  #  ##  # # #    #    ##  #  #          #  #   #  ##  #  #   #
//  #####  #   #  # # #    #    #   #  #       ####  #      #   #  #####
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #  #   #  #
//  #   #   ## #  #   #   ###   #   #   ###    ####   ###   #   #   ###
/**
 * A class that handles the admin cache page.
 */
class AdminCache {
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
        document.querySelectorAll("#admin-cache button").forEach((/** @type {HTMLButtonElement} */btn) => btn.addEventListener("click", async () => {
            const cache = btn.dataset.cache;

            AdminCache.Index.loading(true);

            try {
                const res = await fetch("/api/admin/cache", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cache
                    })
                });

                if (res.status !== 204) {
                    await AdminCache.Index.showModal("Error Occurred", "An error occurred while clearing a cache.  Please try again.");

                    AdminCache.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminCache.Index.showModal("Error Occurred", "An error occurred while clearing a cache.  Please try again.");

                AdminCache.Index.loading(false);

                return;
            }

            AdminCache.Index.loading(false);
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminCache.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminCache.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminCache.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminCache = AdminCache;
} else {
    module.exports = AdminCache; // eslint-disable-line no-undef
}
