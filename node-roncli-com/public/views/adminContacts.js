/**
 * @typedef {import("../../types/browser/viewTypes").AdminContactsViewParameters} ViewTypes.AdminContactsViewParameters
 */

//    #        #           #            ###                  #                    #            #   #    #
//   # #       #                       #   #                 #                    #            #   #
//  #   #   ## #  ## #    ##    # ##   #       ###   # ##   ####    ###    ###   ####    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  #      #   #  ##  #   #         #  #   #   #     #       # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #      #   #  #   #   #      ####  #       #      ###    # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #   #  #  #   #  #   #   #  #      #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #   ###    ###   #   #    ##    ####   ###     ##   ####     #     ###    ###    # #
/**
 * A class that represents the admin contacts view.
 */
class AdminContactsView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminContactsViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div id="admin-contacts" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Contacts Admin</h1></div>
                <div class="panel-body grid center-items">
                    <div class="groups">
                        <div class="group">
                            <div class="group-text"><label for="add-contact-url">URL:</label></div>
                            <input type="text" id="add-contact-url" class="group-input" placeholder="https://website.com/your/url/here" maxlength="256" autocomplete="off" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="add-contact-title">Title:</label></div>
                            <input type="text" id="add-contact-title" class="group-input" placeholder="Contact Title" maxlength="50" autocomplete="off" />
                        </div>
                    </div>
                    <div>
                        <button class="btn" id="add-contact">Add Contact</button>
                    </div>
                </div>
                <div id="contact-list" class="panel-body rounded-bottom">
                    ${data.contacts.map((contact) => /* html */`
                        <div class="pill pill-static grid" style="grid-template-columns: 1fr auto; align-items: center;" data-id="${contact.id}">
                            <div>
                                <a href="${contact.value}">${AdminContactsView.Encoding.htmlEncode(contact.title)}</a>
                            </div>
                            <div class="actions">
                                <button class="btn delete" data-id="${contact.id}">Delete</button>
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
                <div class="info-panel-title rounded-top">Contacts Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>Contacts</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Add or update contacts on the right navigation bar of the website.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminContactsView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminContactsView = AdminContactsView;
} else {
    module.exports = AdminContactsView; // eslint-disable-line no-undef
}
