/*global bootbox*/
var BaseApp = require("rendr/shared/app"),
    handlebarsHelpers = require("./lib/handlebarsHelpers"),
    $ = require("jquery"),
    moment = require("moment"),
    User = require("./models/user"),
    Captcha = require("./models/captcha");

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

        // Setup jQuery validation extensions.
        require("./lib/validationExtensions")();

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
            var today = moment().startOf("day"),
                navs, tabs, loginTab, registerTab, forgotPasswordTab;

            // Display the dialog box.
            bootbox.dialog({
                title: "Log In",
                message: _this.templateAdapter.getTemplate("site/login")(),
                show: false
            }).off("shown.bs.modal").on("shown.bs.modal", function() {
                $("#loginEmail").focus();
            }).modal("show");

            // Cache jQuery objects once the dialog box is shown.
            navs = $("#loginNavs").children();
            tabs = $("#loginTabs").children();
            loginTab = $("#loginTab");
            registerTab = $("#registerTab");
            forgotPasswordTab = $("#forgotPasswordTab");

            // Switch to the login tab when clicked.
            $("#loginNav").on("click", function() {
                navs.removeClass("active");
                $("#loginNavTab").addClass("active");
                tabs.hide();
                loginTab.show();
                $("#loginEmail").focus();
            });

            // Switch to the register tab when clicked.
            $("#registerNav").on("click", function() {
                navs.removeClass("active");
                $("#registerNavTab").addClass("active");
                tabs.hide();
                $("#registerCaptchaImage").attr("src", "/images/captcha.png");
                registerTab.show();
                $("#registerEmail").focus();
            });

            // Switch to the forgot password tab when clicked.
            $("#forgotPasswordNav").on("click", function() {
                navs.removeClass("active");
                $("#forgotPasswordNavTab").addClass("active");
                tabs.hide();
                forgotPasswordTab.show();
                $("#forgotPasswordEmail").focus();
            });

            // Set the default buttons for each tab.
            loginTab.defaultButton("#loginButton");
            registerTab.defaultButton("#registerButton");
            forgotPasswordTab.defaultButton("#forgotPasswordButton");

            // Setup the DOB date picker.
            $("#registerDOBButton").datepicker({
                format: "MM d, yyyy",
                startDate: today.clone().subtract("years", 150).toDate(),
                endDate: today.clone().subtract("years", 13).toDate(),
                startView: "decade",
                autoclose: true
            }).on("changeDate", function(e) {
                var registerDOB = $("#registerDOB");
                if (e.date) {
                    registerDOB.val(moment(e.date).format("MMMM D, YYYY"));
                } else {
                    $(this).datepicker("setDate", registerDOB.val());
                }
                $("#registerCaptcha").focus();
            });

            // Ensure the date picker appears when the date is selected.
            $("#registerDOB").on("focus", function() {
                $("#registerDOBButton").click();
                $(this).blur();
            });

            // Set up validation for login tab.
            $("#loginForm").validate({
                rules: {
                    loginEmail: {
                        required: true,
                        email: true
                    },
                    loginPassword: {
                        required: true,
                        minlength: 6
                    }
                },
                messages: {
                    loginEmail: {
                        required: "You must enter your email address.",
                        email: "The email address you entered is not valid."
                    },
                    loginPassword: {
                        required: "You must enter your password.",
                        minlength: "Your password must be at least 6 characters."
                    }
                },
                errorContainer: "#loginErrorList",
                errorLabelContainer: "#loginErrors"
            });

            // Set up validation for the register tab.
            $("#registerForm").validate({
                rules: {
                    registerEmail: {
                        required: true,
                        email: true,
                        backbone: {
                            model: User,
                            inverse: true,
                            data: function() {
                                return {
                                    emailExists: $("#registerEmail").val()
                                };
                            },
                            settings: {
                                url: "/user/validate"
                            }
                        }
                    },
                    registerPassword: {
                        required: true,
                        minlength: 6
                    },
                    registerRetypePassword: {
                        equalTo: "#registerPassword"
                    },
                    registerAlias: {
                        required: true,
                        minlength: 3,
                        backbone: {
                            model: User,
                            inverse: true,
                            data: function() {
                                return {
                                    aliasExists: $("#registerAlias").val()
                                };
                            },
                            settings: {
                                url: "/user/validate"
                            }
                        }
                    },
                    registerDOB: {
                        required: true,
                        backbone: {
                            model: User,
                            data: function() {
                                return {
                                    coppaDob: $("#registerDOB").val()
                                };
                            },
                            settings: {
                                url: "/user/validate"
                            }
                        }
                    },
                    registerCaptcha: {
                        required: true,
                        backbone: {
                            model: Captcha,
                            data: function() {
                                return {
                                    response: $("#registerCaptcha").val()
                                };
                            },
                            settings: {
                                url: "/captcha/validate"
                            }
                        }
                    }
                },
                messages: {
                    registerEmail: {
                        required: "You must enter an email address.",
                        email: "The email address you entered is not valid.",
                        backbone: "The email address you entered is already in use."
                    },
                    registerPassword: {
                        required: "You must enter a password.",
                        minlength: "Your password must be at least 6 characters."
                    },
                    registerRetypePassword: {
                        equalTo: "The passwords you entered don't match."
                    },
                    registerAlias: {
                        required: "You must enter an alias.",
                        minlength: "Your alias must be at least 3 characters.",
                        backbone: "The alias you entered is already in use."
                    },
                    registerDOB: {
                        required: "You must enter a date of birth.",
                        backbone: "You must be 13 years of age or older to register."
                    },
                    registerCaptcha: {
                        required: "You must type in the characters as shown.",
                        backbone: "The characters you typed do not match the image."
                    }
                },
                errorContainer: "#registerErrorList",
                errorLabelContainer: "#registerErrors"
            });

            // Setup validation for the forgot password tab.
            $("#forgotPasswordForm").validate({
                rules: {
                    forgotPasswordEmail: {
                        required: true,
                        email: true,
                        backbone: {
                            model: User,
                            data: function() {
                                return {
                                    "emailExists": $("#forgotPasswordEmail").val()
                                };
                            },
                            settings: {
                                url: "/user/validate"
                            }
                        }
                    }
                },
                messages: {
                    forgotPasswordEmail: {
                        required: "You must enter your email address.",
                        email: "You must enter a valid email address.",
                        backbone: "The email address you entered does not exist."
                    }
                },
                errorContainer: "#forgotPasswordErrorList",
                errorLabelContainer: "#forgotPasswordErrors"
            });

        });

        // Start loading tweets.
        loadTweets();
        setInterval(loadTweets, 900000);

        // Call base function.
        BaseApp.prototype.start.call(this);
    }
});
