/**
 * @typedef {import("../../types/browser/viewTypes").MusicCategoryViewParameters} ViewTypes.MusicCategoryViewParameters
 * @typedef {import("../../types/browser/viewTypes").MusicCategoryViewInfoParameters} ViewTypes.MusicCategoryViewInfoParameters
 */

//  #   #                  #            ###           #                                        #   #    #
//  #   #                              #   #          #                                        #   #
//  ## ##  #   #   ###    ##     ###   #       ###   ####    ###    ## #   ###   # ##   #   #  #   #   ##     ###   #   #
//  # # #  #   #  #        #    #   #  #          #   #     #   #  #  #   #   #  ##  #  #   #   # #     #    #   #  #   #
//  #   #  #   #   ###     #    #      #       ####   #     #####   ##    #   #  #      #  ##   # #     #    #####  # # #
//  #   #  #  ##      #    #    #   #  #   #  #   #   #  #  #      #      #   #  #       ## #   # #     #    #      # # #
//  #   #   ## #  ####    ###    ###    ###    ####    ##    ###    ###    ###   #          #    #     ###    ###    # #
//                                                                 #   #                #   #
//                                                                  ###                  ###
/**
 * A class that represents the music category view.
 */
class MusicCategoryView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.MusicCategoryViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                ${data.page ? /* html */`
                    <div>
                        ${data.page.page}
                    </div>
                ` : ""}
                ${!data.tracks || data.tracks.length === 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded">Music Temporarily Unavailable</div>
                    </div>
                ` : /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>${MusicCategoryView.Encoding.htmlEncode(data.category)}</h1></div>
                        <div id="music-tracks" class="panel-list grid-columns-3">
                            ${MusicCategoryView.MusicTracksView.get(data.tracks)}
                        </div>
                        <div class="panel-body rounded-bottom grid grid-columns-3-fixed" style="justify-items: center; align-items: center;">
                            <div id="music-pagination" data-total="${Math.ceil(data.count / data.pageSize)}" data-category="${MusicCategoryView.Encoding.attributeEncode(data.category)}">
                                ${MusicCategoryView.PaginationPageView.get({page: 1, total: Math.ceil(data.count / data.pageSize)})}
                            </div>
                            <div>
                                <button class="btn" id="add-all"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i> Add All To Playlist</button>
                            </div>
                            <div>
                                Find music near: <input type="date" id="music-date" min="1998-03-04" max="${data.newestDate}" value="${data.newestDate}" data-category="${MusicCategoryView.Encoding.attributeEncode(data.category)}" />
                            </div>
                        </div>
                    </div>
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Other Categories</h1></div>
                        <div id="tag-cloud" class="panel-body rounded-bottom" style="display: flex; flex-wrap: wrap; column-gap: 4px; row-gap: 4px; align-items: center;">
                            ${data.categories.sort((a, b) => a.category.localeCompare(b.category)).filter((c) => ["Classic", "Release", "Stripped Down", "Preview", "Remake", "B-Side"].indexOf(c.category) === -1).map((c) => /* html */`
                                <div><a class="tag" style="font-size: ${8 + Math.min(c.tracks / 2, 16)}px;" href="/music/category/${MusicCategoryView.Encoding.attributeEncode(c.category)}">${MusicCategoryView.Encoding.htmlEncode(c.category)}</a></div>
                            `).join("")}
                        </div>
                    </div>
                `}
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
     * @param {ViewTypes.MusicCategoryViewInfoParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        const {categories} = data;

        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Music</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/music">Music</a></li>
                        <li>${MusicCategoryView.Encoding.htmlEncode(data.category)}</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Welcome to the home of The Nightstalker.  Here, you can find all of the music I have released over the years, listen to stripped down versions of some of my vocal works, and get a sneak peak at what I'm working on.
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${MusicCategoryView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${MusicCategoryView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${MusicCategoryView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${MusicCategoryView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            ` : ""}
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Categories</div>
                <div class="info-panel-list rounded-bottom">
                    ${categories.sort((a, b) => b.tracks - a.tracks || a.category.localeCompare(b.category)).map((category) => /* html */`
                        <a class="contents" href="${MusicCategoryView.Encoding.attributeEncode(`/music/category/${encodeURI(category.category)}`)}">
                            <div class="center">${MusicCategoryView.Encoding.htmlEncode(category.category)} (${category.tracks})</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("./music/tracks")} */
// @ts-ignore
MusicCategoryView.MusicTracksView = typeof MusicTracksView === "undefined" ? require("./music/tracks") : MusicTracksView; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
MusicCategoryView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("./pagination/page")} */
// @ts-ignore
MusicCategoryView.PaginationPageView = typeof PaginationPageView === "undefined" ? require("./pagination/page") : PaginationPageView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.MusicCategoryView = MusicCategoryView;
} else {
    module.exports = MusicCategoryView; // eslint-disable-line no-undef
}
