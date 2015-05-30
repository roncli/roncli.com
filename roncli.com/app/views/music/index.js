var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the music view.
module.exports = BaseView.extend({
    className: "music_index_view",

    events: {
        "click button#add-all-to-media-player": "addAllToPlaylist",
        "click button.play-song": "playSong"
    },

    postRender: function() {
        "use strict";

        var app = this.app,
            childrenWrapper = $("#children-pages-wrapper");

        if (childrenWrapper.length > 0) {
            setTimeout(function() {
                app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});

                $("div.children-pages").height(Math.min(childrenWrapper.height(), childrenWrapper.find("div.scroller").height()));
            }, 1);
        }
    },

    addAllToPlaylist: function() {
        "use strict";

        $("button.add-song-to-media-player").each(function(index, button) {
            $(button).click();
        });
    },

    playSong: function(ev) {
        "use strict";

        var song = $(ev.target).closest("div.song");

        $("#song-title").text(song.data("title"));
        $("#song-player").empty().append(this.app.templateAdapter.getTemplate("music/song")({resolvedUrl: song.data("audio-url")}));
    }
});

module.exports.id = "music/index";
