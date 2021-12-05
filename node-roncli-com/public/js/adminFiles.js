//    #        #           #           #####    #     ##
//   # #       #                       #               #
//  #   #   ## #  ## #    ##    # ##   #       ##      #     ###    ###
//  #   #  #  ##  # # #    #    ##  #  ####     #      #    #   #  #
//  #####  #   #  # # #    #    #   #  #        #      #    #####   ###
//  #   #  #  ##  # # #    #    #   #  #        #      #    #          #
//  #   #   ## #  #   #   ###   #   #  #       ###    ###    ###   ####
/**
 * A class that handles the admin files page.
 */
class AdminFiles {
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
        document.querySelectorAll("div#admin-files button.delete").forEach((el) => el.addEventListener("click", async () => {
            const path = /** @type {HTMLButtonElement} */(el).dataset.path; // eslint-disable-line no-extra-parens

            AdminFiles.Index.loading(true);

            try {
                const res = await fetch("/api/admin/files", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        path
                    })
                });

                if (res.status !== 204) {
                    if (res.status === 409) {
                        await AdminFiles.Index.showModal("Directory Not Empty", "You must clear the directory of other files and directories before deleting it.");
                    } else {
                        await AdminFiles.Index.showModal("Error Occurred", "An error occurred while deleting a file.  Please try again.");
                    }

                    AdminFiles.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminFiles.Index.showModal("Error Occurred", "An error occurred while deleting a file.  Please try again.");

                AdminFiles.Index.loading(false);

                return;
            }

            el.closest("div.pill").remove();

            AdminFiles.Index.loading(false);
        }));

        document.getElementById("create-directory").addEventListener("click", async () => {
            const dirName = /** @type {HTMLInputElement} */(document.getElementById("create-directory-name")).value, // eslint-disable-line no-extra-parens
                currentPath = /** @type {HTMLSpanElement} */(document.getElementById("current-path")).innerText; // eslint-disable-line no-extra-parens

            AdminFiles.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/files", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        path: currentPath,
                        directory: dirName
                    })
                });

                if (res.status !== 200) {
                    if (res.status === 409) {
                        await AdminFiles.Index.showModal("File or Directory Exists", "A file or directory exists with the same name.  Please use a different directory name and try again.");
                    } else {
                        await AdminFiles.Index.showModal("Error Occurred", "An error occurred while creating a directory.  Please try again.");
                    }

                    AdminFiles.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminFiles.Index.showModal("Error Occurred", "An error occurred while creating a directory.  Please try again.");

                AdminFiles.Index.loading(false);

                return;
            }

            await AdminFiles.Template.loadTemplate("/views/adminFiles.js", "AdminFilesView");

            document.getElementById("page-html").innerHTML = AdminFiles.Template.renderTemplate(data, window.AdminFilesView.get);

            AdminFiles.Index.loading(false);

            AdminFiles.DOMContentLoaded();

            await AdminFiles.SPA.setupWidgets();
        });

        document.getElementById("upload").addEventListener("click", async () => {
            const file = /** @type {HTMLInputElement} */(document.getElementById("upload-file")).files[0], // eslint-disable-line no-extra-parens
                currentPath = /** @type {HTMLSpanElement} */(document.getElementById("current-path")).innerText; // eslint-disable-line no-extra-parens

            AdminFiles.Index.loading(true);

            let data;

            try {
                const formData = new FormData();
                formData.append("path", currentPath);
                formData.append("file", file);

                const res = await fetch("/api/admin/files/upload", {
                    method: "POST",
                    body: formData
                });

                if (res.status !== 200) {
                    if (res.status === 409) {
                        await AdminFiles.Index.showModal("File or Directory Exists", "A file or directory exists with the same name.  Please upload with a different filename and try again.");
                    } else {
                        await AdminFiles.Index.showModal("Error Occurred", "An error occurred while uploading a file.  Please try again.");
                    }

                    AdminFiles.Index.loading(false);

                    return;
                }

                data = await res.json();
            } catch (err) {
                await AdminFiles.Index.showModal("Error Occurred", "An error occurred while uploading a file.  Please try again.");

                AdminFiles.Index.loading(false);

                return;
            }

            await AdminFiles.Template.loadTemplate("/views/adminFiles.js", "AdminFilesView");

            document.getElementById("page-html").innerHTML = AdminFiles.Template.renderTemplate(data, window.AdminFilesView.get);

            AdminFiles.Index.loading(false);

            AdminFiles.DOMContentLoaded();

            await AdminFiles.SPA.setupWidgets();
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminFiles.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
AdminFiles.SPA = typeof SPA === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminFiles.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminFiles.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminFiles = AdminFiles;
} else {
    module.exports = AdminFiles; // eslint-disable-line no-undef
}
