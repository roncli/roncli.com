/**
 * @typedef {import("../../types/browser/viewTypes").MusicViewParameters} ViewTypes.MusicViewParameters
 * @typedef {import("../../types/browser/viewTypes").MusicViewInfoParameters} ViewTypes.MusicViewInfoParameters
 */

//  #   #                  #           #   #    #
//  #   #                              #   #
//  ## ##  #   #   ###    ##     ###   #   #   ##     ###   #   #
//  # # #  #   #  #        #    #   #   # #     #    #   #  #   #
//  #   #  #   #   ###     #    #       # #     #    #####  # # #
//  #   #  #  ##      #    #    #   #   # #     #    #      # # #
//  #   #   ## #  ####    ###    ###     #     ###    ###    # #
/**
 * A class that represents the music view.
 */
class MusicView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.MusicViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                <div>
                    ${data.page.page}
                </div>
                ${!data.tracks || data.tracks.length === 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded">Music Temporarily Unavailable</div>
                    </div>
                ` : /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Music</h1></div>
                        <div id="music-tracks" class="panel-list grid-columns-3">
                            ${MusicView.MusicTracksView.get(data.tracks)}
                        </div>
                        <div class="panel-body rounded-bottom grid grid-columns-3-fixed" style="justify-items: center; align-items: center;">
                            <div id="music-pagination" data-total="${Math.ceil(data.count / data.pageSize)}">
                                ${MusicView.PaginationPageView.get({page: 1, total: Math.ceil(data.count / data.pageSize)})}
                            </div>
                            <div>
                                <button class="btn" id="add-all"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i> Add All To Playlist</button>
                            </div>
                            <div>
                                Find music near: <input type="date" id="music-date" min="1998-03-04" max="${data.newestDate}" value="${data.newestDate}" />
                            </div>
                        </div>
                    </div>
                    <div id="discography">
                        <div class="grid grid-columns-3-fixed">
                            <a class="content" href="/music/category/Classic">
                                <div class="pill center">
                                    <h3>Classics</h3>
                                    <div>These are the timeless classics that define the music of The Nightstalker.</div>
                                </div>
                            </a>
                            <a class="content" href="/music/category/Release">
                                <div class="pill center">
                                    <h3>Releases</h3>
                                    <div>An archive of The Nightstalker's significant releases.</div>
                                </div>
                            </a>
                            <a class="content" href="/music/category/Stripped Down">
                                <div class="pill center">
                                    <h3>Stripped Down</h3>
                                    <div>Experience the raw emotion of The Nightstalker with this collection of stripped down recordings.</div>
                                </div>
                            </a>
                            <a class="content" href="/music/category/Preview">
                                <div class="pill center">
                                    <h3>Previews</h3>
                                    <div>Listen to clips and early versions of new works from The Nightstalker.</div>
                                </div>
                            </a>
                            <a class="content" href="/music/category/Remake">
                                <div class="pill center">
                                    <h3>Remakes</h3>
                                    <div>Here you will find new versions of old songs, touched up and re-imagined.</div>
                                </div>
                            </a>
                            <a class="content" href="/music/category/B-Side">
                                <div class="pill center">
                                    <h3>B-Sides</h3>
                                    <div>Not every song can be an instant classic.  These are some of the more obscure releases from The Nightstalker.</div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Other Categories</h1></div>
                        <div id="tag-cloud" class="panel-body rounded-bottom" style="display: flex; flex-wrap: wrap; column-gap: 4px; row-gap: 4px; align-items: center;">
                            ${data.categories.sort((a, b) => a.category.localeCompare(b.category)).filter((c) => ["Classic", "Release", "Stripped Down", "Preview", "Remake", "B-Side"].indexOf(c.category) === -1).map((c) => /* html */`
                                <div><a class="tag" style="font-size: ${8 + Math.min(c.tracks / 2, 16)}px;" href="/music/category/${MusicView.Encoding.attributeEncode(c.category)}">${MusicView.Encoding.htmlEncode(c.category)}</a></div>
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
     * @param {ViewTypes.MusicViewInfoParameters} data The info data.
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
                        <li>Music</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Welcome to the home of The Nightstalker.  Here, you can find all of the music I have released over the years, listen to stripped down versions of some of my vocal works, and get a sneak peak at what I'm working on.
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${MusicView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${MusicView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${MusicView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${MusicView.Encoding.htmlEncode(p.shortTitle)}</div>
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
                        <a class="contents" href="${MusicView.Encoding.attributeEncode(`/music/category/${encodeURI(category.category)}`)}">
                            <div class="center">${MusicView.Encoding.htmlEncode(category.category)} (${category.tracks})</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("./music/tracks")} */
// @ts-ignore
MusicView.MusicTracksView = typeof MusicTracksView === "undefined" ? require("./music/tracks") : MusicTracksView; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
MusicView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("./pagination/page")} */
// @ts-ignore
MusicView.PaginationPageView = typeof PaginationPageView === "undefined" ? require("./pagination/page") : PaginationPageView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.MusicView = MusicView;
} else {
    module.exports = MusicView; // eslint-disable-line no-undef
}
