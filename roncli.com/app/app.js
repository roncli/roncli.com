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
     * Empty function in case fonts load prior to App start.
     */
    fontsComplete: function() {
        "use strict";
    },

    /**
     * Script to load fonts from Google.
     */
    loadFonts: function(window) {
        "use strict";

        var app = this,
            document = window.document;

        window.WebFontConfig = {
            google: {
                families: ["Archivo+Narrow:400,700,400italic,700italic:latin,latin-ext"]
            },
            active: function() {
                app.fontsComplete();
            },
            inactive: function() {
                app.fontsComplete();
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

        app.fontsCompleteFxs = [
            function() {
                // Start loading tweets.
                loadTweets();
                setInterval(loadTweets, 900000);
            }
        ];

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
            var user = new User();
            user.fetch({
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

                // Display the dialog box.
                bootbox.dialog({
                    title: "Log In",
                    message: app.templateAdapter.getTemplate("site/login")(),
                    show: false
                }).off("shown.bs.modal").on("shown.bs.modal", function() {
                    $("#login-email").focus();
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
                            backbone: {
                                model: User,
                                inverse: true,
                                data: function() {
                                    return {
                                        emailExists: $("#register-email").val()
                                    };
                                },
                                settings: {
                                    url: "/user/validate"
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
                            backbone: {
                                model: User,
                                inverse: true,
                                data: function() {
                                    return {
                                        aliasExists: $("#register-alias").val()
                                    };
                                },
                                settings: {
                                    url: "/user/validate"
                                }
                            }
                        },
                        "register-dob": {
                            required: true,
                            backbone: {
                                model: User,
                                data: function() {
                                    return {
                                        coppaDob: $("#register-dob").val()
                                    };
                                },
                                settings: {
                                    url: "/user/validate"
                                }
                            }
                        },
                        "register-captcha": {
                            required: true,
                            backbone: {
                                model: Captcha,
                                data: function() {
                                    return {
                                        response: $("#register-captcha").val()
                                    };
                                },
                                settings: {
                                    url: "/captcha/validate"
                                }
                            }
                        }
                    },
                    messages: {
                        "register-email": {
                            required: "You must enter an email address.",
                            email: "The email address you entered is not valid.",
                            backbone: "The email address you entered is already in use."
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
                            backbone: "The alias you entered is already in use."
                        },
                        "register-dob": {
                            required: "You must enter a date of birth.",
                            backbone: "You must be 13 years of age or older to register."
                        },
                        "register-captcha": {
                            required: "You must type in the characters as shown.",
                            backbone: "The characters you typed do not match the image."
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
                            backbone: {
                                model: User,
                                data: function() {
                                    return {
                                        "emailExists": $("#forgot-password-email").val()
                                    };
                                },
                                settings: {
                                    url: "/user/validate"
                                }
                            }
                        }
                    },
                    messages: {
                        "forgot-password-email": {
                            required: "You must enter your email address.",
                            email: "You must enter a valid email address.",
                            backbone: "The email address you entered does not exist."
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
                    var user;

                    registerForm.validate().element("#register-retype-password");
                    if (registerForm.valid()) {
                        registerForm.find("input, button").prop("disabled", true);
                        user = new User();
                        user.fetch({
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
                    var user;

                    if (forgotPasswordForm.valid()) {
                        forgotPasswordForm.find("input, button").prop("disabled", true);
                        user = new User();
                        user.fetch({
                            url: "/user/forgot-password",
                            data: JSON.stringify({
                                email: $("#forgot-password-email").val()
                            }),
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            success: function() {
                                bootbox.hideAll();

                                if (user.get("validationRequired")) {
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
            app.router.navigate($(this).data("href"), {trigger: true});
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
        });

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
                                        backbone: {
                                            model: Captcha,
                                            data: function() {
                                                return {
                                                    response: $("#password-reset-captcha").val()
                                                };
                                            },
                                            settings: {
                                                url: "/captcha/validate"
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
                                        backbone: "The characters you typed do not match the image."
                                    }
                                },
                                errorContainer: "#password-reset-error-list",
                                errorLabelContainer: "#password-reset-errors"
                            });

                            // Setup reset password button.
                            $("#password-reset-button").on("click", function() {
                                var user;

                                passwordResetForm.validate().element("#password-reset-retype-password");
                                if (passwordResetForm.valid()) {
                                    passwordResetForm.find("input, button").prop("disabled", true);
                                    user = new User();
                                    user.fetch({
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
                                var user;

                                if (emailChangeForm.valid()) {
                                    emailChangeForm.find("input, button").prop("disabled", true);
                                    user = new User();
                                    user.fetch({
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
    }
});
