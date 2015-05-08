var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the home view.
module.exports = BaseView.extend({
    className: "home_index_view",

    postRender: function() {
        "use strict";

        $("div.blog img").each(function() {
            var image = $(this);
            image.load(function() {
                var width = this.width;
                $("<img />").attr("src", $(this).attr("src")).load(function() {
                    if (width !== this.width) {
                        image.addClass("thumb").attr("title", "Click to view full image in a new window");
                    }
                });
            });
        });
    }
});

module.exports.id = "home/index";
