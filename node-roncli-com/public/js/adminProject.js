//    #        #           #           ####                    #                  #
//   # #       #                       #   #                                      #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##
//                                                          #  #
//                                                           ##
/**
 * A class that handles the admin project page.
 */
class AdminProject {
    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page.
     * @returns {void}
     */
    static DOMContentLoaded() {
        document.getElementById("update-project").addEventListener("click", async () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("project-url")).innerText, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("update-project-title")).value, // eslint-disable-line no-extra-parens
                user = /** @type {HTMLInputElement} */(document.getElementById("update-project-github-user")).value, // eslint-disable-line no-extra-parens
                repository = /** @type {HTMLInputElement} */(document.getElementById("update-project-github-repository")).value, // eslint-disable-line no-extra-parens
                description = /** @type {HTMLInputElement} */(document.getElementById("update-project-description")).value; // eslint-disable-line no-extra-parens

            if (!title || title === "") {
                await AdminProject.Index.showModal("Invalid Title", "You must enter a title.");
                return;
            }

            if (!user || user === "") {
                await AdminProject.Index.showModal("Invalid User", "You must enter a GitHub user.");
                return;
            }

            if (!repository || repository === "") {
                await AdminProject.Index.showModal("Invalid Repository", "You must enter a GitHub repository.");
                return;
            }

            AdminProject.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/project", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url,
                        title,
                        user,
                        repository,
                        description
                    })
                });

                if (res.status === 409) {
                    data = await res.json();

                    await AdminProject.Index.showModal("Cannot Update Project", `${data.message}`);

                    AdminProject.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminProject.Index.showModal("Error Occurred", "An error occurred while updating a project.  Please try again.");

                    AdminProject.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminProject.Index.showModal("Error Occurred", "An error occurred while updating a project.  Please try again.");

                AdminProject.Index.loading(false);

                return;
            }

            AdminProject.Index.loading(false);
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminProject.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminProject.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminProject = AdminProject;
} else {
    module.exports = AdminProject; // eslint-disable-line no-undef
}
