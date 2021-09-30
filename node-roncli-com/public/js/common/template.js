//  #####                        ##            #
//    #                           #            #
//    #     ###   ## #   # ##     #     ###   ####    ###
//    #    #   #  # # #  ##  #    #        #   #     #   #
//    #    #####  # # #  ##  #    #     ####   #     #####
//    #    #      # # #  # ##     #    #   #   #  #  #
//    #     ###   #   #  #       ###    ####    ##    ###
//                       #
//                       #
/**
 * A class that provides template functions.
 */
class Template {
    // ##                   #  ###                     ##           #
    //  #                   #   #                       #           #
    //  #     ##    ###   ###   #     ##   # #   ###    #     ###  ###    ##
    //  #    #  #  #  #  #  #   #    # ##  ####  #  #   #    #  #   #    # ##
    //  #    #  #  # ##  #  #   #    ##    #  #  #  #   #    # ##   #    ##
    // ###    ##    # #   ###   #     ##   #  #  ###   ###    # #    ##   ##
    //                                           #
    /**
     * Load a template into memory.
     * @param {string} path The path of the template.
     * @param {string} [className] The name of the class.
     * @returns {Promise} A promise that resolves when the template is loaded.
     */
    static async loadTemplate(path, className) {
        if (className && window[className] || Template.loadedPaths.has(path)) {
            return;
        }

        const script = document.createElement("script");

        await new Promise((resolve) => {
            script.onload = () => {
                resolve();
            };
            script.src = `/js/?files=${path}`;

            document.head.appendChild(script);

            Template.loadedPaths.add(path);
        });
    }

    //                      #              ###                     ##           #
    //                      #               #                       #           #
    // ###    ##   ###    ###   ##   ###    #     ##   # #   ###    #     ###  ###    ##
    // #  #  # ##  #  #  #  #  # ##  #  #   #    # ##  ####  #  #   #    #  #   #    # ##
    // #     ##    #  #  #  #  ##    #      #    ##    #  #  #  #   #    # ##   #    ##
    // #      ##   #  #   ###   ##   #      #     ##   #  #  ###   ###    # #    ##   ##
    //                                                       #
    /**
     * Renders data into a template.
     * @param {any} data The data to load.
     * @param {function} template The template function.
     * @returns {string} The rendered data.
     */
    static renderTemplate(data, template) {
        if (Array.isArray(data)) {
            return data.map((item) => template(item)).join("");
        }

        return template(data);
    }
}

Template.loadedPaths = new Set();

if (typeof module === "undefined") {
    window.Template = Template;
} else {
    module.exports = Template; // eslint-disable-line no-undef
}
