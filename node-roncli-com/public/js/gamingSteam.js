//   ###                   #                   ###    #
//  #   #                                     #   #   #
//  #       ###   ## #    ##    # ##    ## #  #      ####    ###    ###   ## #
//  #          #  # # #    #    ##  #  #  #    ###    #     #   #      #  # # #
//  #  ##   ####  # # #    #    #   #   ##        #   #     #####   ####  # # #
//  #   #  #   #  # # #    #    #   #  #      #   #   #  #  #      #   #  # # #
//   ###    ####  #   #   ###   #   #   ###    ###     ##    ###    ####  #   #
//                                     #   #
//                                      ###
/**
 * A class that handles the Steam page.
 */
class GamingSteam {
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
        document.querySelectorAll("div#steam-pagination a.page").forEach((/** @type {HTMLAnchorElement} */el) => el.addEventListener("click", async (ev) => {
            ev.preventDefault();

            const page = +el.dataset.page;

            GamingSteam.Index.loading(true);

            let data;

            try {
                const res = await fetch(`/api/steam-game?page=${page}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.status !== 200) {
                    await GamingSteam.Index.showModal("Error Occurred", "An error occurred while loading the list of Steam games.  Please try again.");

                    GamingSteam.Index.loading(false);

                    return false;
                }

                data = await res.json();
            } catch (err) {
                await GamingSteam.Index.showModal("Error Occurred", "An error occurred while loading the list of Steam games.  Please try again.");

                GamingSteam.Index.loading(false);

                return false;
            }

            document.getElementById("steam-games-list").innerHTML = window.GamingSteamGamesView.get({games: data});

            const steamPagination = document.getElementById("steam-pagination");

            steamPagination.innerHTML = window.PaginationPageView.get({page, total: +steamPagination.dataset.total});

            GamingSteam.Index.loading(false);

            GamingSteam.DOMContentLoaded();

            return false;
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
GamingSteam.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", GamingSteam.DOMContentLoaded);

if (typeof module === "undefined") {
    window.GamingSteam = GamingSteam;
} else {
    module.exports = GamingSteam; // eslint-disable-line no-undef
}
