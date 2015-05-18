/*global swfobject*/

var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the home view.
module.exports = BaseView.extend({
    className: "home_index_view",

    postRender: function() {
        "use strict";

        var view = this,
            app = this.app,
            panel = $("#twitch-panel");

        // Load Twitch stream
        window.onPlayerEvent = function(data) {
            if (app.router.currentView !== view) {
                app.twitchPlayer = null;
                window.onPlayerEvent = null;
                return;
            }
            data.forEach(function(event) {
                switch (event.event) {
                    case "playerInit":
                        app.twitchPlayer = $("#twitch-stream")[0];
                        app.twitchPlayer.playVideo();
                        break;
                    case "online":
                        panel.attr("style", "");
                        break;
                    case "offline":
                        panel.attr("style", "height: 0; margin-bottom: 0;");
                        break;
                }
            });
        };

        swfobject.embedSWF("//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf", "twitch-stream", "100%", "400", "11", null, {
            "eventsCallback": "onPlayerEvent",
            "embed": 1,
            "channel": "roncli",
            "auto_play": "true"
        }, {
            "allowScriptAccess": "always",
            "allowFullScreen": "true"
        });
    }
});

module.exports.id = "home/index";
