/**
 * @typedef {import("../../types/browser/viewTypes").AdminFrontPageViewParameters} ViewTypes.AdminFrontPageViewParameters
 */

//    #        #           #           #####                        #     ####                        #   #    #
//   # #       #                       #                            #     #   #                       #   #
//  #   #   ## #  ## #    ##    # ##   #      # ##    ###   # ##   ####   #   #   ###    ## #   ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #  ##  #   #     ####       #  #  #   #   #   # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #      #      #   #  #   #   #     #       ####   ##    #####   # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #  #   #   #  #  #      #   #  #      #       # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #   #    ##   #       ####   ###    ###     #     ###    ###    # #
//                                                                                      #   #
//                                                                                       ###
/**
 * A class that represents the admin front page view.
 */
class AdminFrontPageView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminFrontPageViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded"><h1>Front Page Admin</h1></div>
            </div>
            <div class="grid grid-columns-2-fixed pad-top">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Music</h1></div>
                    <div class="panel-body grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="music-feature-path">Path to the Feature:</label></div>
                                <input type="text" id="music-feature-path" class="group-input" placeholder="/path/to/feature" maxlength="256" autocomplete="off" />
                            </div>
                            <div class="group">
                                <div class="group-text"><label for="music-feature-title">Title of the Page:</label></div>
                                <input type="text" id="music-feature-title" class="group-input" placeholder="Page Title" maxlength="256" autocomplete="off" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="music-feature-add">Add Music Feature</button>
                        </div>
                    </div>
                    <div class="panel-body rounded-bottom">
                        <div id="music-features">
                            ${data.music.map((f) => /* html */`
                                <div class="pill pill-sortable grid" style="align-items: center; grid-template-columns: 1fr 1fr auto;" data-id="${AdminFrontPageView.Encoding.attributeEncode(f.url)}">
                                    <div class="url">${AdminFrontPageView.Encoding.htmlEncode(f.url)}</div>
                                    <div class="title">${AdminFrontPageView.Encoding.htmlEncode(f.title)}</div>
                                    <div class="delete"><button class="btn delete">Delete</button></div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Coding</h1></div>
                    <div class="panel-body grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="coding-feature-path">Path to the Feature:</label></div>
                                <input type="text" id="coding-feature-path" class="group-input" placeholder="/path/to/feature" maxlength="256" autocomplete="off" />
                            </div>
                            <div class="group">
                                <div class="group-text"><label for="coding-feature-title">Title of the Page:</label></div>
                                <input type="text" id="coding-feature-title" class="group-input" placeholder="Page Title" maxlength="256" autocomplete="off" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="coding-feature-add">Add Coding Feature</button>
                        </div>
                    </div>
                    <div class="panel-body rounded-bottom">
                        <div id="coding-features">
                            ${data.coding.map((f) => /* html */`
                                <div class="pill pill-sortable grid" style="align-items: center; grid-template-columns: 1fr 1fr auto;" data-id="${AdminFrontPageView.Encoding.attributeEncode(f.url)}">
                                    <div class="url">${AdminFrontPageView.Encoding.htmlEncode(f.url)}</div>
                                    <div class="title">${AdminFrontPageView.Encoding.htmlEncode(f.title)}</div>
                                    <div class="delete"><button class="btn delete">Delete</button></div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Gaming</h1></div>
                    <div class="panel-body grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="gaming-feature-path">Path to the Feature:</label></div>
                                <input type="text" id="gaming-feature-path" class="group-input" placeholder="/path/to/feature" maxlength="256" autocomplete="off" />
                            </div>
                            <div class="group">
                                <div class="group-text"><label for="gaming-feature-title">Title of the Page:</label></div>
                                <input type="text" id="gaming-feature-title" class="group-input" placeholder="Page Title" maxlength="256" autocomplete="off" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="gaming-feature-add">Add Gaming Feature</button>
                        </div>
                    </div>
                    <div class="panel-body rounded-bottom">
                        <div id="gaming-features">
                            ${data.gaming.map((f) => /* html */`
                                <div class="pill pill-sortable grid" style="align-items: center; grid-template-columns: 1fr 1fr auto;" data-id="${AdminFrontPageView.Encoding.attributeEncode(f.url)}">
                                    <div class="url">${AdminFrontPageView.Encoding.htmlEncode(f.url)}</div>
                                    <div class="title">${AdminFrontPageView.Encoding.htmlEncode(f.title)}</div>
                                    <div class="delete"><button class="btn delete">Delete</button></div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Life</h1></div>
                    <div class="panel-body grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="life-feature-path">Path to the Feature:</label></div>
                                <input type="text" id="life-feature-path" class="group-input" placeholder="/path/to/feature" maxlength="256" autocomplete="off" />
                            </div>
                            <div class="group">
                                <div class="group-text"><label for="life-feature-title">Title of the Page:</label></div>
                                <input type="text" id="life-feature-title" class="group-input" placeholder="Page Title" maxlength="256" autocomplete="off" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="life-feature-add">Add Life Feature</button>
                        </div>
                    </div>
                    <div class="panel-body rounded-bottom">
                        <div id="life-features">
                            ${data.life.map((f) => /* html */`
                                <div class="pill pill-sortable grid" style="align-items: center; grid-template-columns: 1fr 1fr auto;" data-id="${AdminFrontPageView.Encoding.attributeEncode(f.url)}">
                                    <div class="url">${AdminFrontPageView.Encoding.htmlEncode(f.url)}</div>
                                    <div class="title">${AdminFrontPageView.Encoding.htmlEncode(f.title)}</div>
                                    <div class="delete"><button class="btn delete">Delete</button></div>
                                </div>
                            `).join("")}
                        </div>
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
                <div class="info-panel-title rounded-top">Front Page Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>Front Page</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Rearrange the featured pages on the front page.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminFrontPageView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminFrontPageView = AdminFrontPageView;
} else {
    module.exports = AdminFrontPageView; // eslint-disable-line no-undef
}
