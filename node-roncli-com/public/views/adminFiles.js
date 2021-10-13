/**
 * @typedef {import("../../types/browser/viewTypes").AdminFilesViewParameters} ViewTypes.AdminFilesViewParameters
 */

//    #        #           #           #####    #     ##                  #   #    #
//   # #       #                       #               #                  #   #
//  #   #   ## #  ## #    ##    # ##   #       ##      #     ###    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####     #      #    #   #  #       # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #        #      #    #####   ###    # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #        #      #    #          #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #       ###    ###    ###   ####     #     ###    ###    # #
/**
 * A class that represents the admin files view.
 */
class AdminFilesView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminFilesViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div id="admin-files" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Files Admin - <span id="current-path">${AdminFilesView.Encoding.htmlEncode(data.path || "/")}</span></h1></div>
                <div class="panel-body grid grid-columns-2-fixed center-items">
                    <div class="grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="upload-file">Upload File:</label></div>
                                <input type="file" id="upload-file" class="group-input" placeholder="Select a file" autocomplete="off" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="upload">Upload File</button>
                        </div>
                    </div>
                    <div class="grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="create-directory-name">Create Directory:</label></div>
                                <input type="text" id="create-directory-name" class="group-input" placeholder="New directory name" maxlength="256" autocomplete="off" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="create-directory">Create Directory</button>
                        </div>
                    </div>
                </div>
                ${data.entries.length === 0 ? /* html */`
                    <div class="panel-body rounded-bottom">
                        This directory is empty.
                    </div>
                ` : /* html */`
                    <div class="panel-body rounded-bottom">
                        ${data.entries.map((entry) => /* html */`
                            <div class="pill pill-static grid" style="grid-template-columns: 25fr 2fr 3fr auto; align-items: center;">
                                <div class="name"><a class="contents${entry.size === void 0 ? "" : " download"}" href="${entry.size === void 0 ? "/admin" : ""}/files${data.path}/${entry.name}">${entry.size === void 0 ? /* html */`
                                    <i class="bi-folder"></i>
                                ` : /* html */`
                                    <i class="bi-file-earmark-text"></i>
                                `} ${AdminFilesView.Encoding.htmlEncode(entry.name)}</a></div>
                                <div class="size">${entry.size === void 0 ? "" : /* html */`
                                    ${AdminFilesView.Numbers.fileSize(entry.size)}
                                `}</div>
                                <div class="date">${entry.date === void 0 ? "" : /* html */`
                                    <time class="timeago" datetime="${new Date(entry.date).toISOString()}">${new Date(entry.date).toUTCString()}</time>
                                `}</div>
                                <div class="actions">
                                    <button class="btn delete" data-path="${AdminFilesView.Encoding.attributeEncode(`${data.path}/${entry.name}`)}">Delete</button>
                                </div>
                            </div>
                        `).join("")}
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
     * @param {string} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        const path = data.split("/").filter((p) => p !== "");

        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Files Admin: ${AdminFilesView.Encoding.htmlEncode(data)}</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        ${path.length === 0 ? /* html */`
                            <li>Files</li>
                        ` : /* html */`
                            <li><a href="/admin/files">Files</a></li>
                            ${path.slice(0, path.length - 1).map((p, i) => /* html */`
                                <li><a href="/admin/files/${path.slice(0, i + 1).join("/")}">${AdminFilesView.Encoding.htmlEncode(p)}</a></li>
                            `).join("")}
                            ${data === "" ? "" : /* html */`
                                <li>${AdminFilesView.Encoding.htmlEncode(path[path.length - 1])}</li>
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
AdminFilesView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/numbers")} */
// @ts-ignore
AdminFilesView.Numbers = typeof Numbers === "undefined" ? require("../js/common/numbers") : Numbers; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
AdminFilesView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminFilesView = AdminFilesView;
} else {
    module.exports = AdminFilesView; // eslint-disable-line no-undef
}
