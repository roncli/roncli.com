//    #        #           #           #   #                #####         #
//   # #       #                       #   #                  #           #
//  #   #   ## #  ## #    ##    # ##    # #    ###   #   #    #    #   #  # ##    ###
//  #   #  #  ##  # # #    #    ##  #    #    #   #  #   #    #    #   #  ##  #  #   #
//  #####  #   #  # # #    #    #   #    #    #   #  #   #    #    #   #  #   #  #####
//  #   #  #  ##  # # #    #    #   #    #    #   #  #  ##    #    #  ##  ##  #  #
//  #   #   ## #  #   #   ###   #   #    #     ###    ## #    #     ## #  # ##    ###
/**
 * A class that handles the admin YouTube page.
 */
class AdminYouTube {
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
        document.getElementById("add-allowed-playlist").addEventListener("click", async () => {
            const id = /** @type {HTMLInputElement} */(document.getElementById("add-playlist-id")).value; // eslint-disable-line no-extra-parens

            if (!id || id.length === 0) {
                await AdminYouTube.Index.showModal("Invalid Playlist ID", "You must include the playlist ID.");
                return;
            }

            AdminYouTube.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/youtube", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id
                    })
                });

                if (res.status !== 200) {
                    if (res.status === 409) {
                        await AdminYouTube.Index.showModal("Playlist Already Allowed", "This playlist has already been allowed.");
                    } else {
                        await AdminYouTube.Index.showModal("Error Occurred", "An error occurred while adding an allowed playlist.  Please try again.");
                    }

                    AdminYouTube.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                console.log(err);

                await AdminYouTube.Index.showModal("Error Occurred", "An error occurred while adding an allowed playlist.  Please try again.");

                AdminYouTube.Index.loading(false);

                return;
            }

            document.getElementById("page-html").innerHTML = AdminYouTube.Template.renderTemplate(data, window.AdminYouTubeView.get);

            AdminYouTube.Index.loading(false);

            AdminYouTube.DOMContentLoaded();
        });

        document.querySelectorAll("div#allowed-playlists button.delete").forEach((el) => el.addEventListener("click", async () => {
            const id = /** @type {HTMLButtonElement} */(el).dataset.id; // eslint-disable-line no-extra-parens

            AdminYouTube.Index.loading(true);

            try {
                const res = await fetch("/api/admin/youtube", {
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
                        await AdminYouTube.Index.showModal("Playlist Not Allowed", "This playlist has already been removed from the allowed list.");
                    } else {
                        await AdminYouTube.Index.showModal("Error Occurred", "An error occurred while deleting an allowed playlist.  Please try again.");
                    }

                    AdminYouTube.Index.loading(false);

                    return;
                }
            } catch (err) {
                console.log(err);

                await AdminYouTube.Index.showModal("Error Occurred", "An error occurred while adding an allowed playlist.  Please try again.");

                AdminYouTube.Index.loading(false);

                return;
            }

            el.closest("div.pill").remove();

            AdminYouTube.Index.loading(false);
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminYouTube.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminYouTube.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminYouTube.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminYouTube = AdminYouTube;
} else {
    module.exports = AdminYouTube; // eslint-disable-line no-undef
}
