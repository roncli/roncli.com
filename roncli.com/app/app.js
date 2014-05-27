/*global bootbox*/
var BaseApp = require("rendr/shared/app"),
    handlebarsHelpers = require("./lib/handlebarsHelpers"),
    $ = require("jquery");

// Extend the BaseApp class, adding any custom methods or overrides.
module.exports = BaseApp.extend({

    /**
     * Client and server initialization function.
     */
    initialize: function() {
        "use strict";

        // Register our Handlebars helpers.
        this.templateAdapter.registerHelpers(handlebarsHelpers);
    },

    /**
     * Client-only initialization functions.
     */
    start: function() {
        "use strict";

        var _this = this,
            twitterShown = false,
            IScroll = require("iscroll"),
            scroller,

            /**
             * Get the tweets.
             */
            loadTweets = function() {
                var data = {
                    tweets: {collection: "Tweets"}
                };

                _this.fetch(data, {readFromCache: false, writeToCache: false}, function(err, results) {
                    var divTwitter = $("div.twitter");

                    if (!results) {
                        if (!twitterShown) {
                            divTwitter.hide();
                        }
                        return;
                    }
                    divTwitter.show();
                    twitterShown = true;

                    $("div.tweets").html(_this.templateAdapter.getTemplate("site/tweet")(results.tweets));
                    $("abbr.setTime").removeClass("setTime").timeago();
                    setTimeout(function() {
                        if (scroller) {
                            scroller.destroy();
                        }
                        scroller = new IScroll(".wrapper", {mouseWheel: true, scrollbars: true, snap: "div.tweet"});
                    }, 0);
                });
            };

        // Setup timeago.
        $.timeago.settings.strings.seconds = "a moment";
        $.timeago.settings.strings.minute = "a minute";
        $.timeago.settings.strings.hour = "an hour";
        $.timeago.settings.strings.hours = "%d hours";
        $.timeago.settings.strings.day = "a day";
        $.timeago.settings.strings.month = "a month";
        $.timeago.settings.strings.year = "a year";

        // Setup login form.
        $("#login").on("click", function() {
            var navs, tabs, loginTab, loginEmail, registerTab, forgotPasswordTab;

            bootbox.dialog({
                title: "Log In",
                message: _this.templateAdapter.getTemplate("site/login")()
            });

            navs = $("#loginNavs").children();
            tabs = $("#loginTabs").children();
            loginTab = $("#loginTab");
            loginEmail = $("#loginEmail");
            registerTab = $("#registerTab");
            forgotPasswordTab = $("#forgotPasswordTab");

            tabs.hide();
            loginTab.show();

            $("#loginNav").on("click", function() {
                navs.removeClass("active");
                $("#loginNavTab").addClass("active");
                tabs.hide();
                loginTab.show();
                loginEmail.focus();
            });

            $("#registerNav").on("click", function() {
                navs.removeClass("active");
                $("#registerNavTab").addClass("active");
                tabs.hide();
                $("#registerCaptchaImage").attr("src", "/images/captcha.png");
                registerTab.show();
                $("#registerEmail").focus();
            });

            $("#forgotPasswordNav").on("click", function() {
                navs.removeClass("active");
                $("#forgotPasswordNavTab").addClass("active");
                tabs.hide();
                forgotPasswordTab.show();
                $("#forgotPasswordEmail").focus();
            });

            loginTab.defaultButton("#loginButton");
            registerTab.defaultButton("#registerButton");
            forgotPasswordTab.defaultButton("#forgotPasswordButton");
            loginEmail.focus();
        });

        // Start loading tweets.
        loadTweets();
        setInterval(loadTweets, 900000);

        // Call base function.
        BaseApp.prototype.start.call(this);
    }
});
