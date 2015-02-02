/*global bootbox*/
var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery"),
    User = require("../../models/user"),
    Captcha = require("../../models/captcha");

// Sets up the account view.
module.exports = BaseView.extend({
    className: "account_index_view",

    events: {
        "click button#account-change-email": "changeEmail",
        "click button#account-change-password": "changePassword",
        "click button#account-change-alias": "changeAlias"
    },

    postRender: function() {
        "use strict";

        var app = this.app,
            checkLogin = function() {
                if (app.user && app.user.get("id") !== 0) {
                    $("div#account-panel").html(app.templateAdapter.getTemplate("account/account")(app.user.attributes));
                } else {
                    if (app.router) {
                        app.router.navigate("/", true);
                    }
                }
            };

        if (app.started) {
            checkLogin();
        } else {
            app.once("logged-in", function() {
                checkLogin();
            });
        }
    },

    onLogout: function() {
        "use strict";

        this.app.router.navigate("/", true);
    },

    changeEmail: function() {
        "use strict";

        var view = this,
            emailChangeRequestForm;

        // Display the dialog box.
        bootbox.dialog({
            title: "Request Email Change",
            message: this.app.templateAdapter.getTemplate("account/changeEmailRequest")(),
            show: false
        }).off("shown.bs.modal").on("shown.bs.modal",function() {
            $("#email-change-request-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
            $("#email-change-request-password").focus();
        }).modal("show");

        // Cache jQuery objects once the dialog box is shown.
        emailChangeRequestForm = $("#email-change-request-form");

        emailChangeRequestForm.defaultButton("#email-change-request-button");

        // Set up validation for the form.
        emailChangeRequestForm.validate({
            rules: {
                "email-change-request-captcha": {
                    required: true,
                    backbone: {
                        model: Captcha,
                        data: function() {
                            return {
                                response: $("#email-change-request-captcha").val()
                            };
                        },
                        settings: {
                            url: "/captcha/validate"
                        }
                    }
                }
            },
            messages: {
                "email-change-request-captcha": {
                    required: "You must type in the characters as shown.",
                    backbone: "The characters you typed do not match the image."
                }
            },
            errorContainer: "#email-change-request-error-list",
            errorLabelContainer: "#email-change-request-errors"
        });

        // Setup request email change button.
        $("#email-change-request-button").on("click", function() {
            var user;

            if (emailChangeRequestForm.valid()) {
                emailChangeRequestForm.find("input, button").prop("disabled", true);
                user = new User();
                user.fetch({
                    url: "/user/change-email",
                    data: JSON.stringify({
                        password: $("#email-change-request-password").val(),
                        captcha: $("#email-change-request-captcha").val()
                    }),
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    success: function() {
                        bootbox.hideAll();

                        // Display the dialog box.
                        bootbox.dialog({
                            title: "Email Change",
                            message: view.app.templateAdapter.getTemplate("account/changeEmailRequestSent")(),
                            buttons: {ok: {label: "OK"}},
                            show: false
                        }).off("shown.bs.modal").modal("show");
                    },
                    error: function(xhr, error) {
                        var message;
                        if (error && error.body && error.body.error) {
                            message = error.body.error;
                        } else {
                            message = "There was a server error while requesting your email change.  Plesae try again later.";
                        }
                        $("#email-change-request-server-errors").html(message);
                        $("#email-change-request-server-error-list").show();
                        emailChangeRequestForm.find("input, button").prop("disabled", false);

                        // Reload the captcha image.
                        $("#email-change-request-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                        $("#email-change-request-captcha").val("");
                        emailChangeRequestForm.validate().element("#email-change-request-captcha");
                    }
                });
            }
        });
    },

    changePassword: function() {
        "use strict";

        var view = this,
            changePasswordForm;

        // Display the dialog box.
        bootbox.dialog({
            title: "Change Password",
            message: this.app.templateAdapter.getTemplate("account/changePassword")(),
            show: false
        }).off("shown.bs.modal").on("shown.bs.modal",function() {
            $("#change-password-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
            $("#change-password-old-password").focus();
        }).modal("show");

        // Cache jQuery objects once the dialog box is shown.
        changePasswordForm = $("#change-password-form");

        changePasswordForm.defaultButton("#change-password-button");

        // Set up validation for the form.
        changePasswordForm.validate({
            rules: {
                "change-password-old-password": {
                    required: true
                },
                "change-password-new-password": {
                    required: true,
                    minlength: 6
                },
                "change-password-retype-password": {
                    equalTo: "#change-password-new-password"
                },
                "change-password-captcha": {
                    required: true,
                    backbone: {
                        model: Captcha,
                        data: function() {
                            return {
                                response: $("#change-password-captcha").val()
                            };
                        },
                        settings: {
                            url: "/captcha/validate"
                        }
                    }
                }
            },
            messages: {
                "change-password-old-password": {
                    required: "You must enter your current password."
                },
                "change-password-new-password": {
                    required: "You must enter a new password.",
                    minlength: "Your new password must be at least 6 characters."
                },
                "change-password-retype-password": {
                    equalTo: "The passwords you entered don't match."
                },
                "change-password-captcha": {
                    required: "You must type in the characters as shown.",
                    backbone: "The characters you typed do not match the image."
                }
            },
            errorContainer: "#change-password-error-list",
            errorLabelContainer: "#change-password-errors"
        });

        // Setup change password button.
        $("#change-password-button").on("click", function() {
            var user;

            if (changePasswordForm.valid()) {
                changePasswordForm.find("input, button").prop("disabled", true);
                user = new User();
                user.fetch({
                    url: "/user/change-password",
                    data: JSON.stringify({
                        oldPassword: $("#change-password-old-password").val(),
                        newPassword: $("#change-password-new-password").val(),
                        captcha: $("#change-password-captcha").val()
                    }),
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    success: function() {
                        bootbox.hideAll();

                        // Display the dialog box.
                        bootbox.dialog({
                            title: "Password Changed",
                            message: view.app.templateAdapter.getTemplate("account/passwordChanged")(),
                            buttons: {ok: {label: "OK"}},
                            show: false
                        }).off("shown.bs.modal").modal("show");
                    },
                    error: function(xhr, error) {
                        var message;
                        if (error && error.body && error.body.error) {
                            message = error.body.error;
                        } else {
                            message = "There was a server error while changing your password.  Plesae try again later.";
                        }
                        $("#change-password-server-errors").html(message);
                        $("#change-password-server-error-list").show();
                        changePasswordForm.find("input, button").prop("disabled", false);

                        // Reload the captcha image.
                        $("#change-password-captcha-image").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                        $("#change-password-captcha").val("");
                        changePasswordForm.validate().element("#change-password-captcha");
                    }
                });
            }
        });
    },

    changeAlias: function() {
        "use strict";

        var view = this,
            changeAliasForm;

        // Display the dialog box.
        bootbox.dialog({
            title: "Change Alias",
            message: this.app.templateAdapter.getTemplate("account/changeAlias")(),
            show: false
        }).off("shown.bs.modal").on("shown.bs.modal",function() {
            $("#change-alias-alias").focus();
        }).modal("show");

        // Cache jQuery objects once the dialog box is shown.
        changeAliasForm = $("#change-alias-form");

        changeAliasForm.defaultButton("#change-alias-button");

        // Set up validation for the form.
        changeAliasForm.validate({
            rules: {
                "change-alias-alias": {
                    required: true,
                    minlength: 3,
                    backbone: {
                        model: User,
                        inverse: true,
                        data: function() {
                            return {
                                aliasExists: $("#change-alias-alias").val()
                            };
                        },
                        settings: {
                            url: "/user/validate"
                        }
                    }
                }
            },
            messages: {
                "change-alias-alias": {
                    required: "You must enter an alias.",
                    minlength: "Your alias must be at least 3 characters.",
                    backbone: "The alias you entered is already in use."
                }
            },
            errorContainer: "#change-alias-error-list",
            errorLabelContainer: "#change-alias-errors"
        });

        // Setup change alias button.
        $("#change-alias-button").on("click", function() {
            var alias = $("#change-alias-alias").val(),
                user;

            if (changeAliasForm.valid()) {
                changeAliasForm.find("input, button").prop("disabled", true);
                user = new User();
                user.fetch({
                    url: "/user/change-alias",
                    data: JSON.stringify({alias: alias}),
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    success: function() {
                        bootbox.hideAll();

                        $("#logged-in-user-alias").text(alias);
                        $("#account-alias").text(alias);

                        // Display the dialog box.
                        bootbox.dialog({
                            title: "Alias Changed",
                            message: view.app.templateAdapter.getTemplate("account/aliasChanged")(),
                            buttons: {ok: {label: "OK"}},
                            show: false
                        }).off("shown.bs.modal").modal("show");
                    },
                    error: function(xhr, error) {
                        var message;
                        if (error && error.body && error.body.error) {
                            message = error.body.error;
                        } else {
                            message = "There was a server error while changing your alias.  Plesae try again later.";
                        }
                        $("#change-alias-server-errors").html(message);
                        $("#change-alias-server-error-list").show();
                        changeAliasForm.find("input, button").prop("disabled", false);
                    }
                });
            }
        });
    }
});

module.exports.id = "account/index";
