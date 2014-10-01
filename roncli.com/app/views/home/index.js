/*global twttr*/
var BaseView = require("rendr/shared/base/view");

// Sets up the home view.
module.exports = BaseView.extend({
    className: "home_index_view",

    postRender: function() {
        "use strict";

        twttr.ready(function() {
            twttr.widgets.load();
        });
    }
});

module.exports.id = "home/index";
