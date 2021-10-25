/**
 * @typedef {import("../../types/browser/viewTypes").AdminViewParameters} ViewTypes.AdminViewParameters
 */

//    #        #           #           #   #    #
//   # #       #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #   # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #   # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #    #     ###    ###    # #
/**
 * A class that represents the admin view.
 */
class AdminView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid grid-columns-3-fixed">
                <a href="/admin/cache" class="contents">
                    <div class="pill"><i class="bi-server"></i> Cache</div>
                </a>
                <a href="/admin/files" class="contents">
                    <div class="pill"><i class="bi-folder"></i> Files</div>
                </a>
                <a href="/admin/front-page" class="contents">
                    <div class="pill"><i class="bi-newspaper"></i> Front Page</div>
                </a>
                <a href="/admin/moderation" class="contents">
                    <div class="pill center-self"><span><i class="bi-circle-fill"></i> Moderation</span>${data.commentsToModerate === 0 ? "" : /* html */`
                        &nbsp;<span class="badge">${data.commentsToModerate.toLocaleString("en-US")}</span>
                    `}</div>
                </a>
                <a href="/admin/pages" class="contents">
                    <div class="pill"><i class="bi-file-earmark-text"></i> Pages</div>
                </a>
                <a href="/admin/projects" class="contents">
                    <div class="pill"><i class="bi-github"></i> Projects</div>
                </a>
                <a href="/admin/redirects" class="contents">
                    <div class="pill"><i class="bi-arrow-repeat"></i> Redirects</div>
                </a>
                <a href="/admin/youtube" class="contents">
                    <div class="pill"><i class="bi-youtube"></i> YouTube</div>
                </a>
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
                <div class="info-panel-title rounded-top">Site Administration</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li>Admin</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    From here you have control over various parts of the website.
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.AdminView = AdminView;
} else {
    module.exports = AdminView; // eslint-disable-line no-undef
}
