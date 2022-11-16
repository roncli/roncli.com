//    #        #           #            ###                  #                    #
//   # #       #                       #   #                 #                    #
//  #   #   ## #  ## #    ##    # ##   #       ###   # ##   ####    ###    ###   ####    ###
//  #   #  #  ##  # # #    #    ##  #  #      #   #  ##  #   #         #  #   #   #     #
//  #####  #   #  # # #    #    #   #  #      #   #  #   #   #      ####  #       #      ###
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #   #  #  #   #  #   #   #  #      #
//  #   #   ## #  #   #   ###   #   #   ###    ###   #   #    ##    ####   ###     ##   ####
/**
 * A class that handles the admin contacts page.
 */
class AdminContacts {
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
        document.getElementById("add-contact").addEventListener("click", async () => {
            const url = /** @type {HTMLInputElement} */(document.getElementById("add-contact-url")).value, // eslint-disable-line no-extra-parens
                title = /** @type {HTMLInputElement} */(document.getElementById("add-contact-title")).value; // eslint-disable-line no-extra-parens

            if (!url || url === "" || !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:")) {
                await AdminContacts.Index.showModal("Invalid URL", "You must enter a valid URL or email, starting with http or mailto.");
                return;
            }

            if (!title || title === "") {
                await AdminContacts.Index.showModal("Invalid Title", "You must enter a title.");
                return;
            }

            AdminContacts.Index.loading(true);

            let data;

            try {
                const res = await fetch("/api/admin/contacts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url,
                        title
                    })
                });

                if (res.status === 409) {
                    data = await res.json();

                    await AdminContacts.Index.showModal("Cannot Add Contact", `${data.message}`);

                    AdminContacts.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminContacts.Index.showModal("Error Occurred", "An error occurred while creating a new contact.  Please try again.");

                    AdminContacts.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminContacts.Index.showModal("Error Occurred", "An error occurred while creating a new contact.  Please try again.");

                AdminContacts.Index.loading(false);

                return;
            }

            AdminContacts.SPA.loadPage("/admin/contacts");
        });

        document.querySelectorAll("button.delete").forEach((b) => b.addEventListener("click", async (ev) => {
            const btn = /** @type {HTMLButtonElement} */(ev.target), // eslint-disable-line no-extra-parens
                id = btn.dataset.id; // eslint-disable-line no-extra-parens

            AdminContacts.Index.loading(true);

            try {
                const res = await fetch("/api/admin/contacts", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id
                    })
                });

                if (res.status === 404) {
                    await AdminContacts.Index.showModal("Contact Does Not Exist", "This contact does not exist.");

                    AdminContacts.Index.loading(false);

                    return;
                } else if (res.status !== 204) {
                    await AdminContacts.Index.showModal("Error Occurred", "An error occurred while deleting a contact.  Please try again.");

                    AdminContacts.Index.loading(false);

                    return;
                }
            } catch (err) {
                await AdminContacts.Index.showModal("Error Occurred", "An error occurred while deleting a contact.  Please try again.");

                AdminContacts.Index.loading(false);

                return;
            }

            btn.closest("div.pill").remove();

            AdminContacts.Index.loading(false);
        }));
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
AdminContacts.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./spa")} */
// @ts-ignore
AdminContacts.SPA = typeof SPA === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

/** @type {typeof import("./common/template")} */
// @ts-ignore
AdminContacts.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", AdminContacts.DOMContentLoaded);

if (typeof module === "undefined") {
    window.AdminContacts = AdminContacts;
} else {
    module.exports = AdminContacts; // eslint-disable-line no-undef
}
