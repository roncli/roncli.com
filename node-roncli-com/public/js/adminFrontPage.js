//    #        #           #           #####                        #     ####
//   # #       #                       #                            #     #   #
//  #   #   ## #  ## #    ##    # ##   #      # ##    ###   # ##   ####   #   #   ###    ## #   ###
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #  ##  #   #     ####       #  #  #   #   #
//  #####  #   #  # # #    #    #   #  #      #      #   #  #   #   #     #       ####   ##    #####
//  #   #  #  ##  # # #    #    #   #  #      #      #   #  #   #   #  #  #      #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #   #    ##   #       ####   ###    ###
//                                                                                      #   #
//                                                                                       ###
/**
 * A class that handles the admin front page... uh... page.
 */
class AdminFrontPage {
    //          #     #  ####               #
    //          #     #  #                  #
    //  ###   ###   ###  ###    ##    ###  ###   #  #  ###    ##
    // #  #  #  #  #  #  #     # ##  #  #   #    #  #  #  #  # ##
    // # ##  #  #  #  #  #     ##    # ##   #    #  #  #     ##
    //  # #   ###   ###  #      ##    # #    ##   ###  #      ##
    /**
     * Adds a feature.
     * @param {string} section The section.
     * @param {string} url The URL.
     * @param {string} title The title.
     * @returns {Promise} A promise that resolves when the feature has been added.
     */
    static async addFeature(section, url, title) {
        AdminFrontPage.Index.loading(true);

        let data;

        try {
            const res = await fetch("/api/admin/front-page", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    section,
                    url,
                    title
                })
            });

            if (res.status !== 200) {
                if (res.status === 409) {
                    await AdminFrontPage.Index.showModal("Feature Already Exists", "The feature you are trying to add already exists.");
                } else {
                    await AdminFrontPage.Index.showModal("Error Occurred", "An error occurred while adding a feature.  Please try again.");
                }

                AdminFrontPage.Index.loading(false);

                return;
            }

            data = await res.json();
        } catch (err) {
            await AdminFrontPage.Index.showModal("Error Occurred", "An error occurred while adding a feature.  Please try again.");

            AdminFrontPage.Index.loading(false);

            return;
        }

        document.getElementById("page-html").innerHTML = AdminFrontPage.Template.renderTemplate(data, window.AdminFrontPageView.get);

        AdminFrontPage.Index.loading(false);

        AdminFrontPage.DOMContentLoaded();
    }

    //    #        ##           #          ####               #
    //    #         #           #          #                  #
    //  ###   ##    #     ##   ###    ##   ###    ##    ###  ###   #  #  ###    ##
    // #  #  # ##   #    # ##   #    # ##  #     # ##  #  #   #    #  #  #  #  # ##
    // #  #  ##     #    ##     #    ##    #     ##    # ##   #    #  #  #     ##
    //  ###   ##   ###    ##     ##   ##   #      ##    # #    ##   ###  #      ##
    /**
     * Deletes a feature.
     * @param {string} section The section.
     * @param {string} url The URL.
     * @returns {Promise} A promise that resolves when the feature has been deleted.
     */
    static async deleteFeature(section, url) {
        AdminFrontPage.Index.loading(true);

        let data;

        try {
            const res = await fetch("/api/admin/front-page", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    section,
                    url
                })
            });

            if (res.status !== 200) {
                await AdminFrontPage.Index.showModal("Error Occurred", "An error occurred while deleting a feature.  Please try again.");

                AdminFrontPage.Index.loading(false);

                return;
            }

            data = await res.json();
        } catch (err) {
            await AdminFrontPage.Index.showModal("Error Occurred", "An error occurred while deleting a feature.  Please try again.");

            AdminFrontPage.Index.loading(false);

            return;
        }

        document.getElementById("page-html").innerHTML = AdminFrontPage.Template.renderTemplate(data, window.AdminFrontPageView.get);

        AdminFrontPage.Index.loading(false);

        AdminFrontPage.DOMContentLoaded();
    }

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
        AdminFrontPage.Sortable.create(document.getElementById("music-features"), {
            store: {
                get: () => [],
                set: async (sortable) => {
                    try {
                        const res = await fetch("/api/admin/front-page", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                section: "music",
                                order: sortable.toArray()
                            })
                        });

                        if (res.status !== 204) {
                            await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                        }
                    } catch (err) {
                        await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                    }
                }
            }
        });

        AdminFrontPage.Sortable.create(document.getElementById("coding-features"), {
            store: {
                get: () => [],
                set: async (sortable) => {
                    try {
                        const res = await fetch("/api/admin/front-page", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                section: "coding",
                                order: sortable.toArray()
                            })
                        });

                        if (res.status !== 204) {
                            await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                        }
                    } catch (err) {
                        await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                    }
                }
            }
        });

        AdminFrontPage.Sortable.create(document.getElementById("gaming-features"), {
            store: {
                get: () => [],
                set: async (sortable) => {
                    try {
                        const res = await fetch("/api/admin/front-page", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                section: "gaming",
                                order: sortable.toArray()
                            })
                        });

                        if (res.status !== 204) {
                            await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                        }
                    } catch (err) {
                        await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                    }
                }
            }
        });

        AdminFrontPage.Sortable.create(document.getElementById("life-features"), {
            store: {
                get: () => [],
                set: async (sortable) => {
                    try {
                        const res = await fetch("/api/admin/front-page", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                section: "life",
                                order: sortable.toArray()
                            })
                        });

                        if (res.status !== 204) {
                            await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                        }
                    } catch (err) {
                        await AdminFrontPage.Index.showModal("Error Occurred", "There was a server error ordering the pages.  Please try again later.");
                    }
                }
            }
        });

        document.getElementById("music-feature-add").addEventListener("click", () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("music-feature-path")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("music-feature-title")).value; // eslint-disable-line no-extra-parens

            return AdminFrontPage.addFeature("music", url, title);
        });

        document.getElementById("coding-feature-add").addEventListener("click", () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("coding-feature-path")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("coding-feature-title")).value; // eslint-disable-line no-extra-parens

            return AdminFrontPage.addFeature("coding", url, title);
        });

        document.getElementById("gaming-feature-add").addEventListener("click", () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("gaming-feature-path")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("gaming-feature-title")).value; // eslint-disable-line no-extra-parens

            return AdminFrontPage.addFeature("gaming", url, title);
        });

        document.getElementById("life-feature-add").addEventListener("click", () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("life-feature-path")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("life-feature-title")).value; // eslint-disable-line no-extra-parens

            return AdminFrontPage.addFeature("life", url, title);
        });

        document.querySelectorAll("div#music-features div.delete").forEach((b) => b.addEventListener("click", (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                url = /** @type {HTMLDivElement} */(btn.closest(".pill")).dataset.id; // eslint-disable-line no-extra-parens

            return AdminFrontPage.deleteFeature("music", url);
        }));

        document.querySelectorAll("div#coding-features div.delete").forEach((b) => b.addEventListener("click", (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                url = /** @type {HTMLDivElement} */(btn.closest(".pill")).dataset.id; // eslint-disable-line no-extra-parens

            return AdminFrontPage.deleteFeature("coding", url);
        }));

        document.querySelectorAll("div#gaming-features div.delete").forEach((b) => b.addEventListener("click", (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                url = /** @type {HTMLDivElement} */(btn.closest(".pill")).dataset.id; // eslint-disable-line no-extra-parens

            return AdminFrontPage.deleteFeature("gaming", url);
        }));

        document.querySelectorAll("div#life-features div.delete").forEach((b) => b.addEventListener("click", (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                url = /** @type {HTMLDivElement} */(btn.closest(".pill")).dataset.id; // eslint-disable-line no-extra-parens

            return AdminFrontPage.deleteFeature("life", url);
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminFrontPage.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("../../node_modules/@types/sortablejs")} */
// @ts-ignore
AdminFrontPage.Sortable = typeof Sortable === "undefined" ? require("../../node_modules/sortablejs/Sortable") : Sortable; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminFrontPage.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminFrontPage.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminFrontPage = AdminFrontPage;
} else {
    module.exports = AdminFrontPage; // eslint-disable-line no-undef
}
