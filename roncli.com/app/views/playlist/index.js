var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the playlist view.
module.exports = BaseView.extend({
    className: "playlist_index_view",

    events: {
        "click button#add-all-to-media-player": "addAllToPlaylist",
        "click button.play-video": "playVideo"
    },

    addAllToPlaylist: function() {
        "use strict";

        $("button.add-video-to-media-player").each(function(index, button) {
            $(button).click();
        });
    },

    playVideo: function(ev) {
        "use strict";

        var video = $(ev.target).closest("div.video");

        $("#video-title").text(video.data("title"));
        $("#video-player").empty().append(this.app.templateAdapter.getTemplate("playlist/video")({id: video.data("video-id")}));
    }
});

module.exports.id = "playlist/index";
