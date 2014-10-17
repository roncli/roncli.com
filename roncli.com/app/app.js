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

        var app = this,
            twitterShown = false,
            IScroll = require("iscroll"),
            querystring = $.getParam(),
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
                app.pageScrollers.push(
                    new IScroll(selector, options)
                );
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
            $("div#site-nav").html(app.templateAdapter.getTemplate("site/loggedIn")(app.user));

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
                    $("#loginEmail").focus();
                }).modal("show");

                // Cache jQuery objects once the dialog box is shown.
                loginForm = $("#loginForm");
                loginTab = $("#loginTab");
                registerForm = $("#registerForm");
                registerTab = $("#registerTab");
                forgotPasswordForm = $("#forgotPasswordForm");
                forgotPasswordTab = $("#forgotPasswordTab");

                // Set focus when tabs are clicked.
                $("#loginNav").on("shown.bs.tab", function() {
                    $("#loginEmail").focus();
                });

                $("#registerNav").on("shown.bs.tab", function() {
                    $("#registerCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                    $("#registerEmail").focus();
                });

                $("#forgotPasswordNav").on("shown.bs.tab", function() {
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
                    registerForm.validate().element("#registerDOB");
                });

                // Ensure the date picker appears when the date is selected.
                $("#registerDOB").on("focus", function() {
                    $("#registerDOBButton").click();
                    $(this).blur();
                });

                // Set up validation for login tab.
                loginForm.validate({
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
                registerForm.validate({
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
                forgotPasswordForm.validate({
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

                // Setup login button.
                $("#loginButton").on("click", function() {
                    if (loginForm.valid()) {
                        loginForm.find("input, button").attr("disabled", "");
                        attemptLogin({
                            email: $("#loginEmail").val(),
                            password: $("#loginPassword").val(),
                            saveLogin: $("#loginSaveLogin").is(":checked")
                        }, function(err) {
                            if (err) {
                                $("#loginServerErrors").html(err);
                                $("#loginServerErrorList").show();
                                loginForm.find("input, button").removeAttr("disabled");
                            } else {
                                bootbox.hideAll();
                            }
                        });
                    }
                });

                // Setup register button.
                $("#registerButton").on("click", function() {
                    var user;

                    registerForm.validate().element("#registerRetypePassword");
                    if (registerForm.valid()) {
                        registerForm.find("input, button").attr("disabled", "");
                        user = new User();
                        user.fetch({
                            url: "/user/register",
                            data: JSON.stringify({
                                email: $("#registerEmail").val(),
                                password: $("#registerPassword").val(),
                                alias: $("#registerAlias").val(),
                                dob: $("#registerDOB").val(),
                                captcha: $("#registerCaptcha").val()
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
                                $("#registerServerErrors").html(message);
                                $("#registerServerErrorList").show();
                                registerForm.find("input, button").removeAttr("disabled");

                                // Reload the captcha image.
                                $("#registerCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                                $("#registerCaptcha").val("");
                                registerForm.validate().element("#registerCaptcha");
                            }
                        });
                    }
                });

                // Setup forgot password button.
                $("#forgotPasswordButton").on("click", function() {
                    var user;

                    if (forgotPasswordForm.valid()) {
                        forgotPasswordForm.find("input, button").attr("disabled", "");
                        user = new User();
                        user.fetch({
                            url: "/user/forgot-password",
                            data: JSON.stringify({
                                email: $("#forgotPasswordEmail").val()
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
                                $("#forgotPasswordServerErrors").html(message);
                                $("#forgotPasswordServerErrorList").show();
                                forgotPasswordForm.find("input, button").removeAttr("disabled");
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
        $("body").on("submit", "form", function() {
            return false;
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

        // Start loading tweets.
        loadTweets();
        setInterval(loadTweets, 900000);

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
                                $("#passwordResetCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                                $("#passwordResetNewPassword").focus();
                            }).modal("show");

                            // Cache jQuery objects once the dialog box is shown.
                            passwordResetForm = $("#passwordResetForm");

                            passwordResetForm.defaultButton("#passwordResetButton");

                            // Set up validation for the form.
                            passwordResetForm.validate({
                                rules: {
                                    passwordResetNewPassword: {
                                        required: true,
                                        minlength: 6
                                    },
                                    passwordResetRetypePassword: {
                                        equalTo: "#passwordResetNewPassword"
                                    },
                                    passwordResetCaptcha: {
                                        required: true,
                                        backbone: {
                                            model: Captcha,
                                            data: function() {
                                                return {
                                                    response: $("#passwordResetCaptcha").val()
                                                };
                                            },
                                            settings: {
                                                url: "/captcha/validate"
                                            }
                                        }
                                    }
                                },
                                messages: {
                                    passwordResetNewPassword: {
                                        required: "You must enter a new password.",
                                        minlength: "Your new password must be at least 6 characters."
                                    },
                                    passwordResetRetypePassword: {
                                        equalTo: "The passwords you entered don't match."
                                    },
                                    passwordResetCaptcha: {
                                        required: "You must type in the characters as shown.",
                                        backbone: "The characters you typed do not match the image."
                                    }
                                },
                                errorContainer: "#passwordResetErrorList",
                                errorLabelContainer: "#passwordResetErrors"
                            });

                            // Setup reset password button.
                            $("#passwordResetButton").on("click", function() {
                                var user;

                                passwordResetForm.validate().element("#passwordResetRetypePassword");
                                if (passwordResetForm.valid()) {
                                    passwordResetForm.find("input, button").attr("disabled", "");
                                    user = new User();
                                    user.fetch({
                                        url: "/user/password-reset",
                                        data: JSON.stringify({
                                            userId: +querystring.u,
                                            authorizationCode: querystring.a,
                                            password: $("#passwordResetNewPassword").val(),
                                            captcha: $("#passwordResetCaptcha").val()
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
                                            $("#passwordResetServerErrors").html(message);
                                            $("#passwordResetServerErrorList").show();
                                            passwordResetForm.find("input, button").removeAttr("disabled");

                                            // Reload the captcha image.
                                            $("#passwordResetCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                                            $("#passwordResetCaptcha").val("");
                                            passwordResetForm.validate().element("#passwordResetCaptcha");
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
                                $("#emailChangeNewEmail").focus();
                            }).modal("show");

                            // Cache jQuery objects once the dialog box is shown.
                            emailChangeForm = $("#emailChangeForm");

                            emailChangeForm.defaultButton("#emailChangeButton");

                            // Set up validation for the form.
                            emailChangeForm.validate({
                                rules: {
                                    emailChangeNewEmail: {
                                        required: true,
                                        email: true
                                    },
                                    emailChangePassword: {
                                        required: true,
                                        minlength: 6
                                    }
                                },
                                messages: {
                                    emailChangeNewEmail: {
                                        required: "You must enter a new email address.",
                                        email: "The email address you entered is not valid."
                                    },
                                    emailChangePassword: {
                                        required: "You must enter your password.",
                                        minlength: "Your password must be at least 6 characters."
                                    }
                                },
                                errorContainer: "#emailChangeErrorList",
                                errorLabelContainer: "#emailChangeErrors"
                            });

                            // Setup reset password button.
                            $("#emailChangeButton").on("click", function() {
                                var user;

                                if (emailChangeForm.valid()) {
                                    emailChangeForm.find("input, button").attr("disabled", "");
                                    user = new User();
                                    user.fetch({
                                        url: "/user/email-change",
                                        data: JSON.stringify({
                                            userId: +querystring.u,
                                            authorizationCode: querystring.a,
                                            email: $("#emailChangeNewEmail").val(),
                                            password: $("#emailChangePassword").val()
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
                                            $("#emailChangeServerErrors").html(message);
                                            $("#emailChangeServerErrorList").show();
                                            emailChangeForm.find("input, button").removeAttr("disabled");
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
