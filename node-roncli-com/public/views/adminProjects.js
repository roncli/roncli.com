/**
 * @typedef {import("../../types/browser/viewTypes").AdminProjectsViewParameters} ViewTypes.AdminProjectsViewParameters
 */

//    #        #           #           ####                    #                  #            #   #    #
//   # #       #                       #   #                                      #            #   #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #     #       # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #      ###    # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #      #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##   ####     #     ###    ###    # #
//                                                          #  #
//                                                           ##
/**
 * A class that represents the admin projects view.
 */
class AdminProjectsView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminProjectsViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div id="admin-projects" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Projects Admin</h1></div>
                <div class="panel-body grid center-items">
                    <div class="groups">
                        <div class="group">
                            <div class="group-text"><label for="add-project-url">URL:</label></div>
                            <input type="text" id="add-project-url" class="group-input" placeholder="/your/url/here" maxlength="256" autocomplete="off" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="add-project-title">Title:</label></div>
                            <input type="text" id="add-project-title" class="group-input" placeholder="Project Title" maxlength="50" autocomplete="off" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="add-project-github-user">GitHub User:</label></div>
                            <input type="text" id="add-project-github-user" class="group-input" placeholder="user" maxlength="50" autocomplete="off" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="add-project-github-repository">GitHub Repository:</label></div>
                            <input type="text" id="add-project-github-repository" class="group-input" placeholder="repo" maxlength="50" autocomplete="off" />
                        </div>
                    </div>
                    <div>
                        <button class="btn" id="add-project">Add Project</button>
                    </div>
                </div>
                <div id="project-list" class="panel-body rounded-bottom">
                    ${data.projects.map((project) => /* html */`
                        <div class="pill pill-sortable grid" style="grid-template-columns: 1fr auto; align-items: center;" data-id="${project.id}">
                            <div>
                                <a href="/admin/project${project.url}">${AdminProjectsView.Encoding.htmlEncode(project.title)}</a>
                            </div>
                            <div class="actions">
                                <button class="btn delete" data-id="${project.id}">Delete</button>
                            </div>
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
     * @returns {string} An HTML string of the info.
     */
    static getInfo() {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Projects Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>Projects</li>
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
AdminProjectsView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminProjectsView = AdminProjectsView;
} else {
    module.exports = AdminProjectsView; // eslint-disable-line no-undef
}
