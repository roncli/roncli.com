/**
 * @typedef {import("../../types/browser/viewTypes").MusicTrackViewParameters} ViewTypes.MusicTrackViewParameters
 * @typedef {import("../../types/browser/viewTypes").MusicTrackViewInfoParameters} ViewTypes.MusicTrackViewInfoParameters
 */

//  #   #                  #           #####                       #      #   #    #
//  #   #                                #                         #      #   #
//  ## ##  #   #   ###    ##     ###     #    # ##    ###    ###   #   #  #   #   ##     ###   #   #
//  # # #  #   #  #        #    #   #    #    ##  #      #  #   #  #  #    # #     #    #   #  #   #
//  #   #  #   #   ###     #    #        #    #       ####  #      ###     # #     #    #####  # # #
//  #   #  #  ##      #    #    #   #    #    #      #   #  #   #  #  #    # #     #    #      # # #
//  #   #   ## #  ####    ###    ###     #    #       ####   ###   #   #    #     ###    ###    # #
/**
 * A class that represents the music track view.
 */
class MusicTrackView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.MusicTrackViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const navs = data.category ? data.track.categoryNavs[data.category] : data.track.mainNav;

        return /* html */`
            <div class="grid">
                <div class="grid grid-columns-2-fixed">
                    ${navs.prev ? /* html */`
                        <a href="${navs.prev.url}" class="contents music-nav-link" ${data.category ? `data-category="${MusicTrackView.Encoding.attributeEncode(data.category)}"` : ""}>
                            <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                <div class="music-nav">Previous${data.category ? ` ${MusicTrackView.Encoding.htmlEncode(data.category)}` : ""} track:</div>
                                <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(navs.prev.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                    ${navs.next ? /* html */`
                        <a href="${navs.next.url}" class="contents music-nav-link" ${data.category ? `data-category="${MusicTrackView.Encoding.attributeEncode(data.category)}"` : ""}>
                            <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                <div class="music-nav">Next${data.category ? ` ${MusicTrackView.Encoding.htmlEncode(data.category)}` : ""} track:</div>
                                <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(navs.next.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                </div>
                <div class="panel">
                    <div class="panel-title rounded-top">
                        <h1>${MusicTrackView.Encoding.htmlEncode(data.track.title)}</h1>
                        Released <time class="date" datetime="${new Date(data.track.publishDate)}"></time><br />
                        ${data.track.tagList.map((c) => /* html */`
                            <a class="tag" href="/music/category/${MusicTrackView.Encoding.attributeEncode(encodeURI(c))}">${MusicTrackView.Encoding.htmlEncode(c)}</a>
                        `).join("")}
                    </div>
                    <div class="panel-body center">
                        <iframe id="soundcloud-player" src="https://w.soundcloud.com/player/?auto_play=false&buying=true&liking=true&download=true&sharing=true&show_artwork=true&show_comments=true&show_playcount=true&show_user=true&hide_related=true&visual=true&start_track=0&callback=true&color=191935&url=${data.track.uri}" width="100%" height="100%" scrolling="no" frameborder="no"></iframe>
                        <button class="btn btn-primary add-to-media-player" data-source="soundcloud" data-url="${data.track.uri}"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i> Add To Playlist</button>
                    </div>
                    <div class="panel-body rounded-bottom">
                        ${MusicTrackView.Encoding.htmlEncode(data.track.description)}
                    </div>
                </div>
                ${data.page ? /* html */`
                    <div>
                        ${data.page.page}
                    </div>
                ` : ""}
                <div class="grid grid-columns-2-fixed">
                    ${data.category ? /* html */`
                        ${data.track.categoryNavs[data.category].prev ? /* html */`
                            <a href="${data.track.categoryNavs[data.category].prev.url}" class="contents music-nav-link" data-category="${MusicTrackView.Encoding.attributeEncode(data.category)}">
                                <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                    <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                    <div class="music-nav">Previous ${MusicTrackView.Encoding.htmlEncode(data.category)} track:</div>
                                    <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(data.track.categoryNavs[data.category].prev.title)}</div>
                                </div>
                            </a>
                        ` : /* html */`
                            <div></div>
                        `}
                        ${data.track.categoryNavs[data.category].next ? /* html */`
                            <a href="${data.track.categoryNavs[data.category].next.url}" class="contents music-nav-link" data-category="${MusicTrackView.Encoding.attributeEncode(data.category)}">
                                <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                    <div class="music-nav">Next ${MusicTrackView.Encoding.htmlEncode(data.category)} track:</div>
                                    <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                    <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(data.track.categoryNavs[data.category].next.title)}</div>
                                </div>
                            </a>
                        ` : /* html */`
                            <div></div>
                        `}
                    ` : ""}
                    ${data.track.mainNav.prev ? /* html */`
                        <a href="${data.track.mainNav.prev.url}" class="contents music-nav-link">
                            <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                <div class="music-nav">Previous track:</div>
                                <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(data.track.mainNav.prev.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                    ${data.track.mainNav.next ? /* html */`
                        <a href="${data.track.mainNav.next.url}" class="contents music-nav-link">
                            <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                <div class="music-nav">Next track:</div>
                                <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(data.track.mainNav.next.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                    ${Object.keys(data.track.categoryNavs).map((category) => /* html */`
                        ${category === data.category ? "" : /* html */`
                            ${data.track.categoryNavs[category].prev ? /* html */`
                                <a href="${data.track.categoryNavs[category].prev.url}" class="contents music-nav-link" data-category="${MusicTrackView.Encoding.attributeEncode(category)}">
                                    <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                        <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                        <div class="music-nav">Previous ${MusicTrackView.Encoding.htmlEncode(category)} track:</div>
                                        <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(data.track.categoryNavs[category].prev.title)}</div>
                                    </div>
                                </a>
                            ` : /* html */`
                                <div></div>
                            `}
                            ${data.track.categoryNavs[category].next ? /* html */`
                                <a href="${data.track.categoryNavs[category].next.url}" class="contents music-nav-link" data-category="${MusicTrackView.Encoding.attributeEncode(category)}">
                                    <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                        <div class="music-nav">Next ${MusicTrackView.Encoding.htmlEncode(category)} track:</div>
                                        <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                        <div class="music-nav-title">${MusicTrackView.Encoding.htmlEncode(data.track.categoryNavs[category].next.title)}</div>
                                    </div>
                                </a>
                            ` : /* html */`
                                <div></div>
                            `}
                        `}
                    `).join("")}
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
     * @param {ViewTypes.MusicTrackViewInfoParameters} data The info data.
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
                        ${data.category ? /* html */`
                            <li><a href="/music/category/${MusicTrackView.Encoding.attributeEncode(encodeURI(data.category))}">${MusicTrackView.Encoding.htmlEncode(data.category)}</a></li>
                        ` : ""}
                        <li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Welcome to the home of The Nightstalker.  Here, you can find all of the music I have released over the years, listen to stripped down versions of some of my vocal works, and get a sneak peak at what I'm working on.
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${MusicTrackView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${MusicTrackView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${MusicTrackView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${MusicTrackView.Encoding.htmlEncode(p.shortTitle)}</div>
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
                        <a class="contents" href="/music/category/${MusicTrackView.Encoding.attributeEncode(encodeURI(category.category))}">
                            <div class="center">${MusicTrackView.Encoding.htmlEncode(category.category)} (${category.tracks})</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
MusicTrackView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.MusicTrackView = MusicTrackView;
} else {
    module.exports = MusicTrackView; // eslint-disable-line no-undef
}
