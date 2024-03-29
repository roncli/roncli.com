//    #        #           #            ###                 #             #   #    #
//   # #       #                       #   #                #             #   #
//  #   #   ## #  ## #    ##    # ##   #       ###    ###   # ##    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  #          #  #   #  ##  #  #   #   # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #       ####  #      #   #  #####   # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #  #   #  #       # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #   ###    ####   ###   #   #   ###     #     ###    ###    # #
/**
 * A class that represents the admin view.
 */
class AdminCacheView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @returns {string} An HTML string of the page.
     */
    static get() {
        return /* html */`
            <div id="admin-files" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Cache Admin</h1></div>
                <div id="admin-cache" class="panel-body rounded-bottom grid" style="justify-items: center">
                    <div>
                        Select a cache below to clear.
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;">
                        <button class="btn" style="font-size: 20px;" data-cache="blog">Blogger & Tumblr Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="necrolab">Crypt of the NecroDancer Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="d3">Diablo III Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="ff14">Final Fantasy XIV Online Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="github">GitHub Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="soundcloud">SoundCloud Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="speedrun.com">Speedrun.com Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="steam">Steam Cache</button>
                        <button class="btn" style="font-size: 20px;" data-cache="wow">World of Warcraft Cache</button>
                    </div>
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
                <div class="info-panel-title rounded-top">Cache Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>Cache</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Use this page to clear the various caches used by the site.  You will need to clear a cache after you do an update on an external site in order to get the data to appear here.
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.AdminCacheView = AdminCacheView;
} else {
    module.exports = AdminCacheView; // eslint-disable-line no-undef
}
