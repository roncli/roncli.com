//  #   #                  #
//  #   #
//  ## ##  #   #   ###    ##     ###
//  # # #  #   #  #        #    #   #
//  #   #  #   #   ###     #    #
//  #   #  #  ##      #    #    #   #
//  #   #   ## #  ####    ###    ###
/**
 * A class that handles the music page.
 */
class Music {
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
        document.querySelectorAll("div#music-pagination a.page").forEach((/** @type {HTMLAnchorElement} */el) => el.addEventListener("click", async (ev) => {
            ev.preventDefault();

            const category = document.getElementById("music-pagination").dataset.category,
                page = +el.dataset.page;

            Music.Index.loading(true);

            let data;

            try {
                const res = await fetch(`/api/music?page=${page}${category ? `&category=${category}` : ""}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.status !== 200) {
                    await Music.Index.showModal("Error Occurred", "An error occurred while loading the list of music tracks.  Please try again.");

                    Music.Index.loading(false);

                    return false;
                }

                data = await res.json();
            } catch (err) {
                await Music.Index.showModal("Error Occurred", "An error occurred while loading the list of music tracks.  Please try again.");

                Music.Index.loading(false);

                return false;
            }

            document.getElementById("music-tracks").innerHTML = window.MusicTracksView.get(data);

            const musicPagination = document.getElementById("music-pagination");

            musicPagination.innerHTML = window.PaginationPageView.get({page, total: +musicPagination.dataset.total});

            Music.Index.loading(false);

            Music.DOMContentLoaded();

            Music.SPA.runTimeago();

            return false;
        }));

        document.getElementById("music-date").addEventListener("change", async () => {
            const category = document.getElementById("music-date").dataset.category,
                date = /** @type {HTMLInputElement} */(document.getElementById("music-date")).value; // eslint-disable-line no-extra-parens

            Music.Index.loading(true);

            let data;

            try {
                const res = await fetch(`/api/music?date=${date}${category ? `&category=${category}` : ""}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.status !== 200) {
                    await Music.Index.showModal("Error Occurred", "An error occurred while loading the list of music posts.  Please try again.");

                    Music.Index.loading(false);

                    return false;
                }

                data = await res.json();
            } catch (err) {
                await Music.Index.showModal("Error Occurred", "An error occurred while loading the list of music posts.  Please try again.");

                Music.Index.loading(false);

                return false;
            }

            document.getElementById("music-tracks").innerHTML = window.MusicTracksView.get(data.tracks);

            const musicPagination = document.getElementById("music-pagination");

            musicPagination.innerHTML = window.PaginationPageView.get({page: data.page, total: +musicPagination.dataset.total});

            Music.Index.loading(false);

            Music.DOMContentLoaded();

            Music.SPA.runTimeago();

            return false;
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
Music.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
Music.SPA = typeof Template === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
Music.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", Music.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Music = Music;
} else {
    module.exports = Music; // eslint-disable-line no-undef
}
