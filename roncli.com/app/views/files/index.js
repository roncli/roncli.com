var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the files view.
module.exports = BaseView.extend({
    className: "files_index_view",

    events: {
        "click a.download-file": "downloadFile",
    },

    downloadFile: function(ev) {
        "use strict";

        // Open download in new window.
        window.open($(ev.target).attr("href"), "_blank");

        // Do not open download in current window!
        return false;
    }
});

module.exports.id = "files/index";
