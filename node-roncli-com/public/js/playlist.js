//  ####    ##                   ##      #            #
//  #   #    #                    #                   #
//  #   #    #     ###   #   #    #     ##     ###   ####
//  ####     #        #  #   #    #      #    #       #
//  #        #     ####  #  ##    #      #     ###    #
//  #        #    #   #   ## #    #      #        #   #  #
//  #       ###    ####      #   ###    ###   ####     ##
//                       #   #
//                        ###
/**
 * A class that handles the playlist page.
 */
class Playlist {
    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page.
     * @returns {Promise} A promise that resolves when the page is setup.
     */
    static async DOMContentLoaded() {
        // Load first video.
        const videos = /** @type {NodeListOf<HTMLButtonElement>} */(document.querySelectorAll("div#playlist-videos div.pill div.play button.play-video")); // eslint-disable-line no-extra-parens

        if (videos.length > 0) {
            await Playlist.Template.loadTemplate("/views/media/youtube.js", "YouTubeView");

            const videoId = videos[0].dataset.id;

            const media = {
                id: "youtube-playlist-video",
                videoId,
                origin: window.location.origin
            };

            document.getElementById("youtube-playlist-item").innerHTML = window.YouTubeView.get(media);
        }

        document.querySelectorAll("button.play-video").forEach((b) => b.addEventListener("click", (ev) => {
            const videoId = /** @type {HTMLButtonElement} */(ev.target).dataset.id; // eslint-disable-line no-extra-parens

            const media = {
                id: "youtube-playlist-video",
                videoId,
                origin: window.location.origin
            };

            document.getElementById("youtube-playlist-item").innerHTML = window.YouTubeView.get(media);
        }));

        document.getElementById("add-all").addEventListener("click", () => {
            document.querySelectorAll("button.add-to-media-player").forEach((/** @type {HTMLButtonElement} */el) => {
                Playlist.Index.addToPlaylist(el.dataset.source, el.dataset.url);
            });
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
Playlist.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
Playlist.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", Playlist.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Playlist = Playlist;
} else {
    module.exports = Playlist; // eslint-disable-line no-undef
}
