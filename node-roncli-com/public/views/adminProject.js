//    #        #           #           ####                    #                  #     #   #    #
//   # #       #                       #   #                                      #     #   #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #      # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #      # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##     #     ###    ###    # #
//                                                          #  #
//                                                           ##
/**
 * @typedef {import("../../types/browser/viewTypes").AdminProjectViewParameters} ViewTypes.AdminProjectViewParameters
 */
class AdminProjectView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminProjectViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div id="admin-projects" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Project Admin - <span id="project-url">${AdminProjectView.Encoding.htmlEncode(data.project.url)}</span></h1></div>
                <div class="panel-body grid center-items rounded-bottom">
                    <div class="groups">
                        <div class="group">
                            <div class="group-text"><label for="update-project-title">Title:</label></div>
                            <input type="text" id="update-project-title" class="group-input" placeholder="Project Title" maxlength="50" autocomplete="off" value="${AdminProjectView.Encoding.attributeEncode(data.project.title)}" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="update-project-github-user">GitHub User:</label></div>
                            <input type="text" id="update-project-github-user" class="group-input" placeholder="user" maxlength="50" autocomplete="off" value="${AdminProjectView.Encoding.attributeEncode(data.project.github.user)}" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="update-project-github-repository">GitHub Repository:</label></div>
                            <input type="text" id="update-project-github-repository" class="group-input" placeholder="repo" maxlength="50" autocomplete="off" value="${AdminProjectView.Encoding.attributeEncode(data.project.github.repository)}" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="update-project-description">Description:</label></div>
                            <input type="text" id="update-project-description" class="group-input" placeholder="Description about the project." autocomplete="off" value="${AdminProjectView.Encoding.attributeEncode(data.project.description)}" />
                        </div>
                    </div>
                    <div>
                        <button class="btn" id="update-project">Update Project</button>
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
     * @param {ViewTypes.AdminProjectViewParameters} data The page data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">${AdminProjectView.Encoding.htmlEncode(data.project.title)}</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li><a href="/admin/projects">Projects</a></li>
                        <li>${AdminProjectView.Encoding.htmlEncode(data.project.title)}</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Add or update projects in the coding section of the website.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminProjectView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminProjectView = AdminProjectView;
} else {
    module.exports = AdminProjectView; // eslint-disable-line no-undef
}
