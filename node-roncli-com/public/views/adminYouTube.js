/**
 * @typedef {import("../../types/browser/viewTypes").AdminYouTubeViewParameters} ViewTypes.AdminYouTubeViewParameters
 */

//    #        #           #           #   #                #####         #             #   #    #
//   # #       #                       #   #                  #           #             #   #
//  #   #   ## #  ## #    ##    # ##    # #    ###   #   #    #    #   #  # ##    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #    #    #   #  #   #    #    #   #  ##  #  #   #   # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #    #    #   #  #   #    #    #   #  #   #  #####   # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #    #    #   #  #  ##    #    #  ##  ##  #  #       # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #    #     ###    ## #    #     ## #  # ##    ###     #     ###    ###    # #
/**
 * A class that represents the admin YouTube view.
 */
class AdminYouTubeView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminYouTubeViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top"><h1>Allowed YouTube Playlists</h1></div>
                <div class="panel-body grid center-items">
                    <div class="groups">
                        <div class="group">
                            <div class="group-text"><label for="add-playlist-id">Playlist ID:</label></div>
                            <input type="text" id="add-playlist-id" class="group-input" placeholder="YouTube Playlist ID" maxlength="256" autocomplete="off" />
                        </div>
                    </div>
                    <div>
                        <button class="btn" id="add-allowed-playlist">Add</button>
                    </div>
                </div>
                <div class="panel-body rounded-bottom">
                    <div id="allowed-playlists">
                        ${data.playlists.map((p) => /* html */`
                            <div class="pill pill-static grid" style="align-items: center; grid-template-columns: 1fr auto;">
                                <div class="title"><a href="https://youtube.com/playlist?list=${AdminYouTubeView.Encoding.attributeEncode(p.id)}" target="_blank">${AdminYouTubeView.Encoding.htmlEncode(p.id)}</a></div>
                                <div class="delete"><button class="btn delete" data-id="${AdminYouTubeView.Encoding.attributeEncode(p.id)}">Delete</button></div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    //              #    ###           #
    //              #     #           # #
    //  ###   ##   ###    #    ###    #     ##
    // #  #  # ##   #     #    #  #  ###   #  #
    //  ##   ##     #     #    #  #   #    #  #
    // #      ##     ##  ###   #  #   #     ##
    //  ###
    /**
     * Gets the rendered info template.
     * @returns {string} An HTML string of the info.
     */
    static getInfo() {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Redirects Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>YouTube</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Add or remove allowed YouTube playlists.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminYouTubeView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminYouTubeView = AdminYouTubeView;
} else {
    module.exports = AdminYouTubeView; // eslint-disable-line no-undef
}
