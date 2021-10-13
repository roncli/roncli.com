/**
 * @typedef {import("../../../types/browser/viewTypes").PaginationPageViewParameters} ViewTypes.PaginationPageViewParameters
 */

//  ####                   #                   #       #                  ####                        #   #    #
//  #   #                                      #                          #   #                       #   #
//  #   #   ###    ## #   ##    # ##    ###   ####    ##     ###   # ##   #   #   ###    ## #   ###   #   #   ##     ###   #   #
//  ####       #  #  #     #    ##  #      #   #       #    #   #  ##  #  ####       #  #  #   #   #   # #     #    #   #  #   #
//  #       ####   ##      #    #   #   ####   #       #    #   #  #   #  #       ####   ##    #####   # #     #    #####  # # #
//  #      #   #  #        #    #   #  #   #   #  #    #    #   #  #   #  #      #   #  #      #       # #     #    #      # # #
//  #       ####   ###    ###   #   #   ####    ##    ###    ###   #   #  #       ####   ###    ###     #     ###    ###    # #
//                #   #                                                                 #   #
//                 ###                                                                   ###
/**
 * A class that represents the pagination page view.
 */
class PaginationPageView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.PaginationPageViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            Page: ${data.page > 1 ? /* html */`
                <a href="#" class="page" data-page="${data.page - 1}">◀️</a>
            ` : ""}
            ${Array(data.total).fill().map((_, index) => /* html */`
                ${index === data.total - 1 && index + 1 - data.page >= 4 ? "..." : ""}
                ${index === 0 || index === data.total - 1 || Math.abs(index + 1 - data.page) <= 2 ? /* html */`
                    ${index + 1 === data.page ? `<b>${index + 1}</b>` : /* html */`
                        <a href="#" class="page tag" data-page="${index + 1}">${index + 1}</a>
                    `}
                ` : ""}
                ${index === 0 && data.page - (index + 1) >= 4 ? "..." : ""}
            `).join("")}
            ${data.page < data.total ? /* html */`
                <a href="#" class="page" data-page="${data.page + 1}">▶️</a>
            ` : ""}
        `;
    }
}

if (typeof module === "undefined") {
    window.PaginationPageView = PaginationPageView;
} else {
    module.exports = PaginationPageView; // eslint-disable-line no-undef
}
