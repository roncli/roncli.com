/**
 * @typedef {import("../../types/browser/viewTypes").DirectoryViewParameters} ViewTypes.DirectoryViewParameters
 */

//  ####     #                          #                          #   #    #
//   #  #                               #                          #   #
//   #  #   ##    # ##    ###    ###   ####    ###   # ##   #   #  #   #   ##     ###   #   #
//   #  #    #    ##  #  #   #  #   #   #     #   #  ##  #  #   #   # #     #    #   #  #   #
//   #  #    #    #      #####  #       #     #   #  #      #  ##   # #     #    #####  # # #
//   #  #    #    #      #      #   #   #  #  #   #  #       ## #   # #     #    #      # # #
//  ####    ###   #       ###    ###     ##    ###   #          #    #     ###    ###    # #
//                                                          #   #
//                                                           ###
/**
 * A class that represents the directory view.
 */
class DirectoryView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.DirectoryViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const path = data.path.split("/").filter((p) => p !== "");

        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top"><h1>Downloads - ${data.path || "/"}</h1></div>
                <div class="panel-list rounded-bottom grid-columns-3" style="grid-template-columns: 1fr repeat(2, auto)">
                    ${data.path && data.path !== "" && data.path !== "/" ? /* html */`
                        <div class="contents-row">
                            <a class="contents" href="/files${path.length <= 1 ? "" : `/${path.slice(0, -1).join("/")}`}"><div><div class="name"><i class="bi-arrow-90deg-up"></i> Up to previous directory</div></div></a>
                            <a class="contents" href="/files${path.length <= 1 ? "" : `/${path.slice(0, -1).join("/")}`}"><div><div class="size"></div></div></a>
                            <a class="contents" href="/files${path.length <= 1 ? "" : `/${path.slice(0, -1).join("/")}`}"><div><div class="date"></div></div></a>
                        </div>
                    ` : ""}
                    ${data.entries.map((entry) => /* html */`
                        <div class="contents-row">
                            <a class="contents${entry.size === void 0 ? "" : " download"}" href="/files${data.path}/${entry.name}">
                                <div><div class="name">${entry.size === void 0 ? /* html */`
                                <i class="bi-folder"></i>
                            ` : /* html */`
                                <i class="bi-file-earmark-text"></i>
                            `} ${DirectoryView.Encoding.htmlEncode(entry.name)}</div></div>
                            </a>
                            <a class="contents${entry.size === void 0 ? "" : " download"}" href="/files${data.path}/${entry.name}">
                                <div><div class="size">${entry.size === void 0 ? "" : /* html */`
                                    ${DirectoryView.Numbers.fileSize(entry.size)}
                                `}</div></div>
                            </a>
                            <a class="contents${entry.size === void 0 ? "" : " download"}" href="/files${data.path}/${entry.name}">
                                <div><div class="date">${entry.date === void 0 ? "" : /* html */`
                                    <time class="timeago" datetime="${new Date(entry.date).toISOString()}">${new Date(entry.date).toUTCString()}</time>
                                `}</div></div>
                            </a>
                        </div>
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
     * @param {string} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        const path = data.split("/").filter((p) => p !== "");

        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Files Directory: ${DirectoryView.Encoding.htmlEncode(data)}</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        ${path.length === 0 ? /* html */`
                            <li>Files</li>
                        ` : /* html */`
                            <li><a href="/files">Files</a></li>
                            ${path.slice(0, path.length - 1).map((p, i) => /* html */`
                                <li><a href="/files/${path.slice(0, i + 1).join("/")}">${DirectoryView.Encoding.htmlEncode(p)}</a></li>
                            `).join("")}
                            ${data === "" ? "" : /* html */`
                                <li>${DirectoryView.Encoding.htmlEncode(path[path.length - 1])}</li>
                            `}
                        `}
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    This is a collection of random files that I have uploaded to make easily available. They range from useful to downright silly. Download at your own risk!
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
DirectoryView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/numbers")} */
// @ts-ignore
DirectoryView.Numbers = typeof Numbers === "undefined" ? require("../js/common/numbers") : Numbers; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
DirectoryView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.DirectoryView = DirectoryView;
} else {
    module.exports = DirectoryView; // eslint-disable-line no-undef
}
