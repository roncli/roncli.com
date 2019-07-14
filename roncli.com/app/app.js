/*global bootbox, siteConfig, SC, YT*/
var BaseApp = require("rendr/shared/app"),
    handlebarsHelpers = require("./lib/handlebarsHelpers"),
    $ = require("jquery"),
    moment = require("moment"),
    User = require("./models/user"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all;

// Extend the BaseApp class, adding any custom methods or overrides.
module.exports = BaseApp.extend({

    // Media player.
    mediaPlayer: {
        playlist: [],
        adding: false,
        toAdd: [],
        playing: false,
        currentIndex: null
    },

    /**
     * Script to load fonts from Google.
     */
    loadFonts: function(window) {
        "use strict";

        var app = this,
            document = window.document;

        window.WebFontConfig = {
            custom: {
                families: ["Archivo Narrow"]
            },
            active: function() {
                if (app.fontsComplete) {
                    app.fontsComplete();
                    app.fontsComplete = null;
                }
            },
            inactive: function() {
                if (app.fontsComplete) {
                    app.fontsComplete();
                    app.fontsComplete = null;
                }
            }
        };
        (function() {
            var e = document.createElement("script");
            e.src = ("https:" === document.location.protocol ? "https" : "http") + "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
            e.type = "text/javascript";
            e.async = "true";
            document.head.appendChild(e);
        }());
    },

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

        var app = this,
            twitterShown = false,
            scriptsRun = {},
            IScroll = require("iscroll"),
            _ = require("underscore"),
            querystring = $.getParam(),
            body = $("body"),
            loggingIn = false,
            scroller, logInUser, doLogout, logOutUser, attemptLogin, user,

            /**
             * Get the tweets.
             */
            loadTweets = function() {
                app.fetch({tweets: {collection: "Tweets"}}, {readFromCache: false, writeToCache: false}, function(err, results) {
                    var divTwitter = $("div.twitter");

                    if (!results) {
                        if (!twitterShown) {
                            divTwitter.hide();
                        }
                        return;
                    }
                    divTwitter.show();
                    twitterShown = true;

                    $("div.tweets").html(app.templateAdapter.getTemplate("site/tweet")(results.tweets));
                    $("abbr.setTime").removeClass("setTime").timeago();
                    setTimeout(function() {
                        var setScroller = function() {
                            if (scroller) {
                                scroller.destroy();
                            }
                            scroller = new IScroll("#tweets-wrapper", {mouseWheel: true, scrollbars: true, snap: "div.tweet"});
                        };
                        if ($("html").is(".wf-active,.wf-inactive")) {
                            setScroller();
                        } else {
                            app.fontsCompleteFxs.push(setScroller);
                        }
                    }, 0);
                });
            };

        app.fontsCompleteFxs = [];

        /**
         * Function to perform when fonts complete loading one way or another.
         */
        app.fontsComplete = function() {
            app.fontsCompleteFxs.forEach(function(fx) {
                fx();
            });
        };

        app.pageScrollers = [];

        /**
         * Adds a scroller.
         * @param {string} selector The selector representing the object to scroll.
         * @param {object} options The IScroll options to use.
         */
        app.addPageScroller = function(selector, options) {
            var setScroller = function() {
                var scroll = new IScroll(selector, options);

                app.pageScrollers.push(scroll);

                scroll.scrollToElement(".selected", null, null, true);
            };

            if ($("html").is(".wf-active,.wf-inactive")) {
                setScroller();
            } else {
                app.fontsCompleteFxs.push(setScroller);
            }
        };

        /**
         * Sets the user to logged in.
         */
        logInUser = function() {
            // Run any scripts if needed.
            app.user.get("accountLinks").forEach(function(link) {
                var onScriptLoad;

                if (scriptsRun[link.text]) {
                    return;
                }

                onScriptLoad = function() {
                    if (link.templates) {
                        app.templateAdapter.templatePatterns.unshift({pattern: new RegExp(link.templates.pattern), src: link.templates.src});
                    }
                    if (link.routes) {
                        require(link.routes)(app);
                    }
                };

                if (link.script) {
                    $.getScript(link.script, onScriptLoad);
                } else {
                    onScriptLoad();
                }

                scriptsRun[link.text] = true;
            });

            // Setup the nav bar.
            $("div#site-nav").html(app.templateAdapter.getTemplate("site/loggedIn")(app.user));
            if (typeof app.router.currentView.onLogin === "function") {
                app.router.currentView.onLogin();
            }

            // Setup logout button.
            $("#logout").on("click", function() {
                doLogout();
            });
        };

        /**
         * Logs out a user at the server.
         */
        doLogout = function() {
            var logoutUser = new User();
            logoutUser.fetch({
                url: "/user/logout",
                type: "POST"
            });
            logOutUser();
        };

        /**
         * Sets the user to logged out.
         */
        logOutUser = function() {
            app.user = null;
            $("div#site-nav").html(app.templateAdapter.getTemplate("site/loggedOut")());

            if (typeof app.router.currentView.onLogout === "function") {
                app.router.currentView.onLogout();
            }

            // Setup login form.
            $("#login").on("click", function() {
                var today = moment().startOf("day"),
                    loginForm, loginTab, registerForm, registerTab, forgotPasswordForm, forgotPasswordTab;

                if (loggingIn) {
                    return;
                }

                loggingIn = true;

                // Display the dialog box.
                bootbox.dialog({
                    title: "Log In",
                    message: app.templateAdapter.getTemplate("site/login")(),
                    show: false
                }).off("shown.bs.modal").on("shown.bs.modal", function() {
                    $("#login-email").focus();
                }).on("hidden.bs.modal", function() {
                    loggingIn = false;
                }).modal("show");

                // Cache jQuery objects once the dialog box is shown.
                loginForm = $("#login-form");
                loginTab = $("#login-tab");
                registerForm = $("#register-form");
                registerTab = $("#register-tab");
                forgotPasswordForm = $("#forgot-password-form");
                forgotPasswordTab = $("#forgot-password-tab");

                // Set focus when tabs are clicked.
                $("#login-nav").on("shown.bs.tab", function() {
                    $("#login-email").focus();
                });

                $("#register-nav").on("shown.bs.tab", function() {
                    $("#register-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                    $("#register-email").focus();
                });

                $("#forgot-password-nav").on("shown.bs.tab", function() {
                    $("#forgot-password-email").focus();
                });

                // Set the default buttons for each tab.
                loginTab.defaultButton("#login-button");
                registerTab.defaultButton("#register-button");
                forgotPasswordTab.defaultButton("#forgot-password-button");

                // Setup the DOB date picker.
                $("#register-dob-button").datepicker({
                    format: "MM d, yyyy",
                    startDate: today.clone().subtract(150, "years").toDate(),
                    endDate: today.clone().subtract(13, "years").toDate(),
                    startView: "decade",
                    autoclose: true
                }).on("changeDate", function(e) {
                    var registerDOB = $("#register-dob");
                    if (e.date) {
                        registerDOB.val(moment(e.date).format("MMMM D, YYYY"));
                    } else {
                        $(this).datepicker("setDate", registerDOB.val());
                    }
                    $("#register-captcha").focus();
                    registerForm.validate().element("#register-dob");
                });

                // Ensure the date picker appears when the date is selected.
                $("#register-dob").on("focus", function() {
                    $("#register-dob-button").click();
                    $(this).blur();
                });

                // Set up validation for login tab.
                loginForm.validate({
                    rules: {
                        "login-email": {
                            required: true,
                            email: true
                        },
                        "login-password": {
                            required: true,
                            minlength: 6
                        }
                    },
                    messages: {
                        "login-email": {
                            required: "You must enter your email address.",
                            email: "The email address you entered is not valid."
                        },
                        "login-password": {
                            required: "You must enter your password.",
                            minlength: "Your password must be at least 6 characters."
                        }
                    },
                    errorContainer: "#login-error-list",
                    errorLabelContainer: "#login-errors"
                });

                // Set up validation for the register tab.
                registerForm.validate({
                    rules: {
                        "register-email": {
                            required: true,
                            email: true,
                            remote: {
                                url: "/api/-/user/validate",
                                type: "POST",
                                data: {
                                    emailExists: function() {
                                        return $("#register-email").val();
                                    },
                                    inverse: true
                                }
                            }
                        },
                        "register-password": {
                            required: true,
                            minlength: 6
                        },
                        "register-retype-password": {
                            equalTo: "#register-password"
                        },
                        "register-alias": {
                            required: true,
                            minlength: 3,
                            remote: {
                                url: "/api/-/user/validate",
                                type: "POST",
                                data: {
                                    aliasExists: function() {
                                        return $("#register-alias").val();
                                    },
                                    inverse: true
                                }
                            }
                        },
                        "register-dob": {
                            required: true,
                            remote: {
                                url: "/api/-/user/validate",
                                type: "POST",
                                data: {
                                    coppaDob: function() {
                                        return $("#register-dob").val();
                                    }
                                }
                            }
                        },
                        "register-captcha": {
                            required: true,
                            remote: {
                                url: "/api/-/captcha/validate",
                                type: "POST",
                                data: {
                                    response: function() {
                                        return $("#register-captcha").val();
                                    }
                                }
                            }
                        }
                    },
                    messages: {
                        "register-email": {
                            required: "You must enter an email address.",
                            email: "The email address you entered is not valid.",
                            remote: "The email address you entered is already in use."
                        },
                        "register-password": {
                            required: "You must enter a password.",
                            minlength: "Your password must be at least 6 characters."
                        },
                        "register-retype-password": {
                            equalTo: "The passwords you entered don't match."
                        },
                        "register-alias": {
                            required: "You must enter an alias.",
                            minlength: "Your alias must be at least 3 characters.",
                            remote: "The alias you entered is already in use."
                        },
                        "register-dob": {
                            required: "You must enter a date of birth.",
                            remote: "You must be 13 years of age or older to register."
                        },
                        "register-captcha": {
                            required: "You must type in the characters as shown.",
                            remote: "The characters you typed do not match the image."
                        }
                    },
                    errorContainer: "#register-error-list",
                    errorLabelContainer: "#register-errors"
                });

                // Setup validation for the forgot password tab.
                forgotPasswordForm.validate({
                    rules: {
                        "forgot-password-email": {
                            required: true,
                            email: true,
                            remote: {
                                url: "/api/-/user/validate",
                                type: "POST",
                                data: {
                                    emailExists: function() {
                                        return $("#forgot-password-email").val();
                                    }
                                }
                            }
                        }
                    },
                    messages: {
                        "forgot-password-email": {
                            required: "You must enter your email address.",
                            email: "You must enter a valid email address.",
                            remote: "The email address you entered does not exist."
                        }
                    },
                    errorContainer: "#forgot-password-error-list",
                    errorLabelContainer: "#forgot-password-errors"
                });

                // Setup login button.
                $("#login-button").on("click", function() {
                    if (loginForm.valid()) {
                        loginForm.find("input, button").prop("disabled", true);
                        attemptLogin({
                            email: $("#login-email").val(),
                            password: $("#login-password").val(),
                            saveLogin: $("#login-save-login").is(":checked")
                        }, function(err) {
                            if (err) {
                                $("#login-server-errors").html(err);
                                $("#login-server-error-list").show();
                                loginForm.find("input, button").prop("disabled", false);
                            } else {
                                bootbox.hideAll();
                            }
                        });
                    }
                });

                // Setup register button.
                $("#register-button").on("click", function() {
                    var registerUser;

                    registerForm.validate().element("#register-retype-password");
                    if (registerForm.valid()) {
                        registerForm.find("input, button").prop("disabled", true);
                        registerUser = new User();
                        registerUser.fetch({
                            url: "/user/register",
                            data: JSON.stringify({
                                email: $("#register-email").val(),
                                password: $("#register-password").val(),
                                alias: $("#register-alias").val(),
                                dob: $("#register-dob").val(),
                                captcha: $("#register-captcha").val()
                            }),
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            success: function() {
                                bootbox.hideAll();

                                // Display the dialog box.
                                bootbox.dialog({
                                    title: "Account Validation Required",
                                    message: app.templateAdapter.getTemplate("site/validationSent")(),
                                    buttons: {ok: {label: "OK"}},
                                    show: false
                                }).off("shown.bs.modal").modal("show");
                            },
                            error: function(xhr, error) {
                                var message;
                                if (error && error.body && error.body.error) {
                                    message = error.body.error;
                                } else {
                                    message = "There was a server error processing your registration.  Please try again later.";
                                }
                                $("#register-server-errors").html(message);
                                $("#register-server-error-list").show();
                                registerForm.find("input, button").prop("disabled", false);

                                // Reload the captcha image.
                                $("#register-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                                $("#register-captcha").val("");
                                registerForm.validate().element("#register-captcha");
                            }
                        });
                    }
                });

                // Setup forgot password button.
                $("#forgot-password-button").on("click", function() {
                    var forgotPasswordUser;

                    if (forgotPasswordForm.valid()) {
                        forgotPasswordForm.find("input, button").prop("disabled", true);
                        forgotPasswordUser = new User();
                        forgotPasswordUser.fetch({
                            url: "/user/forgot-password",
                            data: JSON.stringify({
                                email: $("#forgot-password-email").val()
                            }),
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            success: function() {
                                bootbox.hideAll();

                                if (forgotPasswordUser.get("validationRequired")) {
                                    // Display the dialog box.
                                    bootbox.dialog({
                                        title: "Account Validation Required",
                                        message: app.templateAdapter.getTemplate("site/validationSent")(),
                                        buttons: {ok: {label: "OK"}},
                                        show: false
                                    }).off("shown.bs.modal").modal("show");
                                } else {
                                    // Display the dialog box.
                                    bootbox.dialog({
                                        title: "Password Reset Request",
                                        message: app.templateAdapter.getTemplate("site/passwordRequestSent")(),
                                        buttons: {ok: {label: "OK"}},
                                        show: false
                                    }).off("shown.bs.modal").modal("show");
                                }
                            },
                            error: function(xhr, error) {
                                var message;
                                if (error && error.body && error.body.error) {
                                    message = error.body.error;
                                } else {
                                    message = "There was a server error processing your password recovery request.  Please try again later.";
                                }
                                $("#forgot-password-server-errors").html(message);
                                $("#forgot-password-server-error-list").show();
                                forgotPasswordForm.find("input, button").prop("disabled", false);
                            }
                        });
                    }
                });
            });
        };

        /**
         * Attempts to log in the user with the specified data.
         * @param {object} data The data to log in with.
         * @param {function} [callback] An optional callback to call upon success.
         */
        attemptLogin = function(data, callback) {
            app.user = new User();
            app.user.fetch({
                url: "/user/login",
                data: JSON.stringify(data),
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                success: function() {
                    logInUser();
                    callback();
                },
                error: function(xhr, error) {
                    var message;
                    if (error && error.body && error.body.error) {
                        message = error.body.error;
                    } else {
                        message = "There was a server error processing your login.  Please try again later";
                    }
                    callback(message);
                }
            });
        };

        // Don't submit any forms.
        body.on("submit", "form", function() {
            return false;
        });

        // Handle link buttons.
        body.on("click", "button.link", function() {
            var href = $(this).data("href");

            if (/^http(s):\/\//.test(href)) {
                window.location.href = href;
            } else {
                app.router.navigate(href, {trigger: true});
            }
        });

        // Handle links that should open in a new window.
        $("section#content").on("click", "a.new-window", function(ev) {
            window.open($(this).attr("href"), "_blank");
            return false;
        });

        // Show media player trigger.
        $("#media-player-trigger").show();
        $("#media-player-trigger-button").on("click", function() {
            $("#media-player-panel, #media-player-trigger").toggleClass("open");
        });

        // Setup media links.
        body.on("click", "button.add-to-media-player", function() {
            var button = $(this);
            app.addToPlaylist(button.data("source"), button.data("url"));
        });

        // Setup playlist buttons.
        body.on("click", "div.media-player-item:not(.active) button.media-player-item-play", function() {
            app.play($(this).closest("div.media-player-item").index());
        });

        // Setup playlist removal buttons.
        body.on("click", "button.media-player-item-remove", function() {
            var index = $(this).closest("div.media-player-item").index();

            if (app.mediaPlayer.currentIndex === index) {
                $("#media-player-content-player").empty();
                app.mediaPlayer.currentIndex = null;
                app.mediaPlayer.playing = false;
            } else if (app.mediaPlayer.currentIndex > index) {
                app.mediaPlayer.currentIndex--;
            }

            app.mediaPlayer.playlist.splice(index, 1);

            $($("div.media-player-item")[index]).remove();
        });

        // Pass scrolling events to the view.
        $(document).ready(function() {
            var onScroll = _.debounce(function() {
                if (typeof app.router.currentView.onScroll === "function") {
                    app.router.currentView.onScroll();
                }
            }, 250);
            $(window).on("scroll", onScroll);
            onScroll();
        });

        // Setup timeago.
        $.timeago.settings.strings.seconds = "a moment";
        $.timeago.settings.strings.minute = "a minute";
        $.timeago.settings.strings.hour = "an hour";
        $.timeago.settings.strings.hours = "%d hours";
        $.timeago.settings.strings.day = "a day";
        $.timeago.settings.strings.month = "a month";
        $.timeago.settings.strings.year = "a year";

        // Determine if the user is logged in.
        app.fetch({user: {model: "User"}}, {readFromCache: false, writeToCache: false}, function(err, results) {
            if (results) {
                app.user = results.user;
                app.trigger("logged-in", {user: app.user});
                logInUser();
            } else {
                app.trigger("logged-in", {error: "You are not logged in."});
                logOutUser();
            }

            // Load Tweets.
            if ($("html").is(".wf-active,.wf-inactive")) {
                loadTweets();
            } else {
                app.fontsCompleteFxs.push(loadTweets);
            }
            setInterval(loadTweets, 900000);
        });

        // Dialog boxes to show upon loading the site.
        switch (querystring.go) {
            case "validation":
                if (querystring.u && +querystring.u !== 0 && querystring.v) {
                    user = new User();
                    user.fetch({
                        url: "/user/validate-account",
                        data: JSON.stringify({
                            userId: +querystring.u,
                            validationCode: querystring.v
                        }),
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        success: function() {
                            bootbox.dialog({
                                title: "Registration Complete!",
                                message: app.templateAdapter.getTemplate("site/validationSuccess")(),
                                buttons: {ok: {label: "OK"}},
                                show: false,
                                ok: function() {
                                    $("#login").click();
                                }
                            }).off("shown.bs.modal").modal("show");
                        },
                        error: function() {
                            bootbox.dialog({
                                title: "Account Validation Failed",
                                message: app.templateAdapter.getTemplate("site/validationError")(),
                                buttons: {ok: {label: "OK"}},
                                show: false
                            }).off("shown.bs.modal").modal("show");
                        }
                    });
                }
                break;
            case "passwordReset":
                if (querystring.u && +querystring.u !== 0 && querystring.a) {
                    user = new User();
                    user.fetch({
                        url: "/user/password-reset-request",
                        data: JSON.stringify({
                            userId: +querystring.u,
                            authorizationCode: querystring.a
                        }),
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        success: function() {
                            var passwordResetForm;

                            bootbox.dialog({
                                title: "Reset Your Password",
                                message: app.templateAdapter.getTemplate("site/passwordResetRequest")(),
                                show: false
                            }).off("shown.bs.modal").on("shown.bs.modal", function() {
                                $("#password-reset-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                                $("#password-reset-new-password").focus();
                            }).modal("show");

                            // Cache jQuery objects once the dialog box is shown.
                            passwordResetForm = $("#password-reset-form");

                            passwordResetForm.defaultButton("#password-reset-button");

                            // Set up validation for the form.
                            passwordResetForm.validate({
                                rules: {
                                    "password-reset-new-password": {
                                        required: true,
                                        minlength: 6
                                    },
                                    "password-reset-retype-password": {
                                        equalTo: "#password-reset-new-password"
                                    },
                                    "password-reset-captcha": {
                                        required: true,
                                        remote: {
                                            url: "/api/-/captcha/validate",
                                            type: "POST",
                                            data: {
                                                response: function() {
                                                    return $("#password-reset-captcha").val();
                                                }
                                            }
                                        }
                                    }
                                },
                                messages: {
                                    "password-reset-new-password": {
                                        required: "You must enter a new password.",
                                        minlength: "Your new password must be at least 6 characters."
                                    },
                                    "password-reset-retype-password": {
                                        equalTo: "The passwords you entered don't match."
                                    },
                                    "password-reset-captcha": {
                                        required: "You must type in the characters as shown.",
                                        remote: "The characters you typed do not match the image."
                                    }
                                },
                                errorContainer: "#password-reset-error-list",
                                errorLabelContainer: "#password-reset-errors"
                            });

                            // Setup reset password button.
                            $("#password-reset-button").on("click", function() {
                                var passwordResetUser;

                                passwordResetForm.validate().element("#password-reset-retype-password");
                                if (passwordResetForm.valid()) {
                                    passwordResetForm.find("input, button").prop("disabled", true);
                                    passwordResetUser = new User();
                                    passwordResetUser.fetch({
                                        url: "/user/password-reset",
                                        data: JSON.stringify({
                                            userId: +querystring.u,
                                            authorizationCode: querystring.a,
                                            password: $("#password-reset-new-password").val(),
                                            captcha: $("#password-reset-captcha").val()
                                        }),
                                        type: "POST",
                                        contentType: "application/json",
                                        dataType: "json",
                                        success: function() {
                                            bootbox.hideAll();

                                            // Display the dialog box.
                                            bootbox.dialog({
                                                title: "Password Reset",
                                                message: app.templateAdapter.getTemplate("site/passwordReset")(),
                                                buttons: {ok: {label: "OK"}},
                                                show: false
                                            }).off("shown.bs.modal").modal("show");
                                        },
                                        error: function(xhr, error) {
                                            var message;
                                            if (error && error.body && error.body.error) {
                                                message = error.body.error;
                                            } else {
                                                message = "There was a server error while resetting your password.  Please try again later.";
                                            }
                                            $("#password-reset-server-errors").html(message);
                                            $("#password-reset-server-error-list").show();
                                            passwordResetForm.find("input, button").prop("disabled", false);

                                            // Reload the captcha image.
                                            $("#password-reset-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                                            $("#password-reset-captcha").val("");
                                            passwordResetForm.validate().element("#password-reset-captcha");
                                        }
                                    });
                                }
                            });
                        },
                        error: function() {
                            bootbox.dialog({
                                title: "Password Reset Request Failed",
                                message: app.templateAdapter.getTemplate("site/passwordResetRequestError")(),
                                buttons: {ok: {label: "OK"}},
                                show: false
                            }).off("shown.bs.modal").modal("show");
                        }
                    });
                }
                break;
            case "changeEmail":
                if (querystring.u && +querystring.u !== 0 && querystring.a) {
                    user = new User();
                    user.fetch({
                        url: "/user/email-change-request",
                        data: JSON.stringify({
                            userId: +querystring.u,
                            authorizationCode: querystring.a
                        }),
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        success: function() {
                            var emailChangeForm;

                            bootbox.dialog({
                                title: "Change Your Email Address",
                                message: app.templateAdapter.getTemplate("site/emailChange")(),
                                show: false
                            }).off("shown.bs.modal").on("shown.bs.modal", function() {
                                $("#email-change-new-email").focus();
                            }).modal("show");

                            // Cache jQuery objects once the dialog box is shown.
                            emailChangeForm = $("#email-change-form");

                            emailChangeForm.defaultButton("#email-change-button");

                            // Set up validation for the form.
                            emailChangeForm.validate({
                                rules: {
                                    "email-change-new-email": {
                                        required: true,
                                        email: true
                                    },
                                    "email-change-password": {
                                        required: true,
                                        minlength: 6
                                    }
                                },
                                messages: {
                                    "email-change-new-email": {
                                        required: "You must enter a new email address.",
                                        email: "The email address you entered is not valid."
                                    },
                                    "email-change-password": {
                                        required: "You must enter your password.",
                                        minlength: "Your password must be at least 6 characters."
                                    }
                                },
                                errorContainer: "#email-change-error-list",
                                errorLabelContainer: "#email-change-errors"
                            });

                            // Setup email change button.
                            $("#email-change-button").on("click", function() {
                                var emailChangeUser;

                                if (emailChangeForm.valid()) {
                                    emailChangeForm.find("input, button").prop("disabled", true);
                                    emailChangeUser = new User();
                                    emailChangeUser.fetch({
                                        url: "/user/email-change",
                                        data: JSON.stringify({
                                            userId: +querystring.u,
                                            authorizationCode: querystring.a,
                                            email: $("#email-change-new-email").val(),
                                            password: $("#email-change-password").val()
                                        }),
                                        type: "POST",
                                        contentType: "application/json",
                                        dataType: "json",
                                        success: function() {
                                            bootbox.hideAll();

                                            doLogout();

                                            // Display the dialog box.
                                            bootbox.dialog({
                                                title: "Account Validation Required",
                                                message: app.templateAdapter.getTemplate("site/emailChangeValidationSent")(),
                                                buttons: {ok: {label: "OK"}},
                                                show: false
                                            }).off("shown.bs.modal").modal("show");
                                        },
                                        error: function(xhr, error) {
                                            var message;
                                            if (error && error.body && error.body.error) {
                                                message = error.body.error;
                                            } else {
                                                message = "There was a server error while changing your email address.  Please try again later.";
                                            }
                                            $("#email-change-server-errors").html(message);
                                            $("#email-change-server-error-list").show();
                                            emailChangeForm.find("input, button").prop("disabled", false);
                                        }
                                    });
                                }
                            });
                        },
                        error: function() {
                            bootbox.dialog({
                                title: "Email Change Request Failed",
                                message: app.templateAdapter.getTemplate("site/emailChangeRequestError")(),
                                buttons: {ok: {label: "OK"}},
                                show: false
                            }).off("shown.bs.modal").modal("show");
                        }
                    });
                }
                break;
        }

        this.once("start", function() {
            this.started = true;
        });

        // Call base function.
        BaseApp.prototype.start.call(this);
    },

    /**
     * Adds media to the playlist.
     * @param {string} source The source of the song, such as "soundcloud" or "youtube".
     * @param {string} url The URL of the media.
     */
    addToPlaylist: function(source, url) {
        "use strict";

        var app = this,
            deferred = new Deferred(),
            media = {source: source, url: url},
            matches;

        if (this.mediaPlayer.adding) {
            this.mediaPlayer.toAdd.push(media);
            return;
        }

        this.mediaPlayer.adding = true;

        switch (source) {
            case "soundcloud":
                // Get the track ID.
                matches = /^https?:\/\/api\.soundcloud.com\/tracks\/([0-9]+)(?:\/stream)?/.exec(media.url);
                if (!matches || matches.length < 2) {
                    // Invalid audio.
                    deferred.reject("Invalid SoundCloud track.");
                    return;
                }
                media.trackId = matches[1];

                $.ajax({
                    dataType: "json",
                    url: "https://api.soundcloud.com/tracks/" + media.trackId + "?client_id=" + siteConfig.soundcloud.client_id,
                    success: function(data) {
                        media.title = data.user.username + " - " + data.title;
                        media.resolvedUrl = data.uri;
                        deferred.resolve();
                    },
                    error: function() {
                        deferred.reject("SoundCloud track not found.");
                    }
                });
                break;
            case "youtube":
                media.origin = window.location.origin;

                // Get the video ID.
                matches = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([^&]*)(?:&.*)?$/.exec(media.url);
                if (!matches || matches.length < 2) {
                    // Invalid video.
                    deferred.reject("Invalid YouTube video.");
                    return;
                }
                media.videoId = matches[1];

                $.ajax({
                    dataType: "json",
                    url: window.location.protocol + "//" + window.location.host + "/api/-/youtube/get-video-info?videoId=" + media.videoId,
                    success: function(data) {
                        media.title = data.channelTitle + " - " + data.title;
                        deferred.resolve();
                    },
                    error: function() {
                        deferred.reject("YouTube video not found.");
                    }
                });
                break;
            default:
                deferred.reject("Invalid media format.");
                break;
        }

        deferred.promise.then(function() {
            var nextMedia;

            $("#media-player-playlist").append(app.templateAdapter.getTemplate("media/media")({title: media.title}));
            app.mediaPlayer.playlist.push(media);

            if (!app.mediaPlayer.playing) {
                app.play(app.mediaPlayer.playlist.length - 1);
            }

            if (app.mediaPlayer.toAdd.length > 0) {
                nextMedia = app.mediaPlayer.toAdd.shift();

                app.mediaPlayer.adding = false;
                app.addToPlaylist(nextMedia.source, nextMedia.url);
            } else {
                app.mediaPlayer.adding = false;
            }
        },

        function() {
            bootbox.dialog({
                title: "Error Adding to Playlist",
                message: app.templateAdapter.getTemplate("media/addError")(),
                buttons: {ok: {label: "OK"}},
                show: false
            }).off("shown.bs.modal").modal("show");
        });
    },

    /**
     * Plays media from the playlist.
     * @param {number} playlistIndex The index of the playlist to play.
     */
    play: function(playlistIndex) {
        "use strict";

        var app = this,
            media = this.mediaPlayer.playlist[playlistIndex],
            items = $("div.media-player-item"),
            player = $("#media-player-content-player"),
            backButton = $("#media-player-back"),
            pauseButton = $("#media-player-pause"),
            playButton = $("#media-player-play"),
            forwardButton = $("#media-player-forward"),
            nowPlaying = $("#media-player-now-playing"),
            widget;

        if (!media) {
            return;
        }

        app.mediaPlayer.currentIndex = playlistIndex;
        app.mediaPlayer.playing = true;

        items.removeClass("active");
        $(items[playlistIndex]).addClass("active");

        player.empty();

        nowPlaying.text(media.title);

        media.autoplay = true;
        switch (media.source) {
            case "soundcloud":
                media.visual = true;
                media.id = "media-player-" + media.source;
                break;
        }

        player.html(app.templateAdapter.getTemplate("media/" + media.source)(media));
        player.show();

        switch (media.source) {
            case "soundcloud":
                widget = SC.Widget("media-player-soundcloud");

                backButton.off("click").on("click", function() {
                    app.mediaPlayer.currentIndex--;
                    if (app.mediaPlayer.currentIndex < 0) {
                        app.mediaPlayer.currentIndex = 0;
                    } else {
                        widget.pause();
                        app.play(app.mediaPlayer.currentIndex);
                    }
                });

                pauseButton.off("click").on("click", function() {
                    widget.pause();
                });

                playButton.off("click").on("click", function() {
                    if (!app.mediaPlayer.playing) {
                        widget.play();
                    }
                });

                forwardButton.off("click").on("click", function() {
                    app.mediaPlayer.currentIndex++;
                    if (app.mediaPlayer.currentIndex < app.mediaPlayer.playlist.length) {
                        widget.pause();
                        app.play(app.mediaPlayer.currentIndex);
                    } else {
                        app.mediaPlayer.currentIndex = app.mediaPlayer.playlist.length - 1;
                    }
                });

                widget.bind(SC.Widget.Events.PAUSE, function() {
                    player.hide();
                    app.mediaPlayer.playing = false;
                });

                widget.bind(SC.Widget.Events.PLAY, function() {
                    setTimeout(function() {
                        if (app.mediaPlayer.playing) {
                            player.show();
                        }
                    }, 500);
                    app.mediaPlayer.playing = true;
                });

                widget.bind(SC.Widget.Events.FINISH, function() {
                    player.hide();
                    app.mediaPlayer.playing = false;
                    app.mediaPlayer.currentIndex++;
                    if (app.mediaPlayer.currentIndex < app.mediaPlayer.playlist.length) {
                        app.play(app.mediaPlayer.currentIndex);
                    } else {
                        app.mediaPlayer.currentIndex = app.mediaPlayer.playlist.length - 1;
                    }
                });
                break;
            case "youtube":
                widget = new YT.Player("media-player-youtube");

                backButton.off("click").on("click", function() {
                    app.mediaPlayer.currentIndex--;
                    if (app.mediaPlayer.currentIndex < 0) {
                        app.mediaPlayer.currentIndex = 0;
                    } else {
                        widget.stopVideo();
                        app.play(app.mediaPlayer.currentIndex);
                    }
                });

                pauseButton.off("click").on("click", function() {
                    widget.pauseVideo();
                });

                playButton.off("click").on("click", function() {
                    if (!app.mediaPlayer.playing) {
                        widget.playVideo();
                    }
                });

                forwardButton.off("click").on("click", function() {
                    app.mediaPlayer.currentIndex++;
                    if (app.mediaPlayer.currentIndex < app.mediaPlayer.playlist.length) {
                        widget.stopVideo();
                        app.play(app.mediaPlayer.currentIndex);
                    } else {
                        app.mediaPlayer.currentIndex = app.mediaPlayer.playlist.length - 1;
                    }
                });

                widget.addEventListener("onStateChange", function(event) {
                    switch (event.data) {
                        case YT.PlayerState.PAUSED:
                            player.hide();
                            app.mediaPlayer.playing = false;
                            break;
                        case YT.PlayerState.PLAYING:
                            setTimeout(function() {
                                if (app.mediaPlayer.playing) {
                                    player.show();
                                }
                            }, 500);
                            app.mediaPlayer.playing = true;
                            break;
                        case YT.PlayerState.ENDED:
                            player.hide();
                            app.mediaPlayer.playing = false;
                            app.mediaPlayer.currentIndex++;
                            if (app.mediaPlayer.currentIndex < app.mediaPlayer.playlist.length) {
                                app.play(app.mediaPlayer.currentIndex);
                            } else {
                                app.mediaPlayer.currentIndex = app.mediaPlayer.playlist.length - 1;
                            }
                            break;
                    }
                });
                break;
        }
    }
});
