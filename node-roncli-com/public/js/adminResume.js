//    #        #           #           ####
//   # #       #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ###   #   #  ## #    ###
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #      #   #  # # #  #   #
//  #####  #   #  # # #    #    #   #  # #    #####   ###   #   #  # # #  #####
//  #   #  #  ##  # # #    #    #   #  #  #   #          #  #  ##  # # #  #
//  #   #   ## #  #   #   ###   #   #  #   #   ###   ####    ## #  #   #   ###
/**
 * A class that handles the admin résumé page.
 */
class AdminResume {
    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page.
     * @returns {Promise} A promise that resolves when the page has been setup.
     */
    static async DOMContentLoaded() {
        // Setup HTML editor.
        await AdminResume.Template.loadTemplate("/js/monaco-editor/vs/loader.js", "require");

        window.require.config({paths: {vs: "/js/monaco-editor/vs"}});

        window.require(["vs/editor/editor.main"], () => {
            const el = document.getElementById("html"),
                html = el.dataset.html;

            el.removeAttribute("data-html");

            AdminResume.editor = window.monaco.editor.create(el, {
                value: html,
                language: "json",
                theme: "vs-dark",
                fontFamily: "'FixedsysExcelsiorIIIb Nerd Font', Consolas, 'Courier New', monospace",
                fontSize: 16,
                lineHeight: 16
            });

            AdminResume.SPA.onNavigate = () => {
                AdminResume.editor.dispose();
                AdminResume.editor = void 0;
            };

            AdminResume.SPA.onComplete = () => {
                AdminResume.editor.layout();
            };
        });

        document.getElementById("save-json").addEventListener("click", async () => {
            const json = AdminResume.editor.getValue();

            AdminResume.Index.loading(true);

            try {
                const res = await fetch("/api/admin/resume", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        json
                    })
                });

                if (res.status !== 204) {
                    await AdminResume.Index.showModal("Error Occurred", "An error occurred while saving the résumé.  Please try again.");

                    AdminResume.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminResume.Index.showModal("Error Occurred", "An error occurred while saving the résumé.  Please try again.");

                AdminResume.Index.loading(false);

                return;
            }

            AdminResume.Index.loading(false);
        });

        document.getElementById("fullscreen").addEventListener("click", () => {
            document.getElementById("html").classList.toggle("fullscreen");
            document.getElementById("fullscreen").classList.toggle("fullscreen");
            document.body.classList.toggle("fullscreen");
            if (document.body.classList.contains("fullscreen")) {
                window.scrollTo(0, 0);
            }
            AdminResume.editor.layout();
        });
    }
}

AdminResume.editor = null;

/** @type {typeof import("./index")} */
// @ts-ignore
AdminResume.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
AdminResume.SPA = typeof SPA === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminResume.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminResume.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminResume = AdminResume;
} else {
    module.exports = AdminResume; // eslint-disable-line no-undef
}
