//    #        #           #           ####                    #                  #
//   # #       #                       #   #                                      #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####    ###
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #     #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #      ###
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##   ####
//                                                          #  #
//                                                           ##
/**
 * A class that handles the admin projects page.
 */
class AdminProjects {
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
        AdminProjects.Sortable.create(document.getElementById("project-list"), {
            store: {
                get: () => [],
                set: async (sortable) => {
                    try {
                        const res = await fetch("/api/admin/projects", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                order: sortable.toArray()
                            })
                        });

                        if (res.status !== 204) {
                            await AdminProjects.Index.showModal("Error Occurred", "There was a server error ordering the projects.  Please try again later.");
                        }
                    } catch (err) {
                        await AdminProjects.Index.showModal("Error Occurred", "There was a server error ordering the projects.  Please try again later.");
                    }
                }
            }
        });

        document.getElementById("add-project").addEventListener("click", async () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("add-project-url")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("add-project-title")).value, // eslint-disable-line no-extra-parens
                user = /** @type {HTMLInputElement} */(document.getElementById("add-project-github-user")).value, // eslint-disable-line no-extra-parens
                repository = /** @type {HTMLInputElement} */(document.getElementById("add-project-github-repository")).value; // eslint-disable-line no-extra-parens

            if (!url || url === "" || url === "/" || !url.startsWith("/")) {
                await AdminProjects.Index.showModal("Invalid URL", "You must enter a valid URL beginning with a slash.");
                return;
            }

            if (!title || title === "") {
                await AdminProjects.Index.showModal("Invalid Title", "You must enter a title.");
                return;
            }

            if (!user || user === "") {
                await AdminProjects.Index.showModal("Invalid User", "You must enter a GitHub user.");
                return;
            }

            if (!repository || repository === "") {
                await AdminProjects.Index.showModal("Invalid Repository", "You must enter a GitHub repository.");
                return;
            }

            AdminProjects.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/projects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url,
                        title,
                        user,
                        repository
                    })
                });

                if (res.status === 409) {
                    data = await res.json();

                    await AdminProjects.Index.showModal("Cannot Add Project", `${data.message}`);

                    AdminProjects.Index.loading(false);

                    return;
                } else if (res.status === 400) {
                    await AdminProjects.Index.showModal("Invalid GitHub Repository", "This repository does not exist on GitHub.  Please try again.");

                    AdminProjects.Index.loading(false);

                    return;
                } else if (res.status !== 200) {
                    await AdminProjects.Index.showModal("Error Occurred", "An error occurred while creating a new project.  Please try again.");

                    AdminProjects.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminProjects.Index.showModal("Error Occurred", "An error occurred while creating a new project.  Please try again.");

                AdminProjects.Index.loading(false);

                return;
            }

            AdminProjects.SPA.loadPage(`/admin/project${data.path}`);
        });

        document.querySelectorAll("button.delete").forEach((b) => b.addEventListener("click", async (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                id = btn.dataset.id; // eslint-disable-line no-extra-parens

            AdminProjects.Index.loading(true);

            try {
                const res = await fetch("/api/admin/projects", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id
                    })
                });

                if (res.status === 404) {
                    await AdminProjects.Index.showModal("Project Does Not Exist", "This project does not exist.");

                    AdminProjects.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminProjects.Index.showModal("Error Occurred", "An error occurred while deleting a project.  Please try again.");

                    AdminProjects.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminProjects.Index.showModal("Error Occurred", "An error occurred while deleting a project.  Please try again.");

                AdminProjects.Index.loading(false);

                return;
            }

            btn.closest("div.pill").remove();

            AdminProjects.Index.loading(false);
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminProjects.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("../../node_modules/@types/sortablejs")} */
// @ts-ignore
AdminProjects.Sortable = typeof Sortable === "undefined" ? require("../../node_modules/sortablejs/Sortable") : Sortable; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
AdminProjects.SPA = typeof SPA === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminProjects.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminProjects.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminProjects = AdminProjects;
} else {
    module.exports = AdminProjects; // eslint-disable-line no-undef
}
