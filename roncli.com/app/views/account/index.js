/*global bootbox*/
var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery"),
    User = require("../../models/user"),
    Captcha = require("../../models/captcha");

// Sets up the account view.
module.exports = BaseView.extend({
    className: "account_index_view",

    events: {
        "click button#accountChangeEmail": "changeEmail",
        "click button#accountChangePassword": "changePassword",
        "click button#accountChangeAlias": "changeAlias"
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
            $("#emailChangeRequestCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
            $("#emailChangeRequestPassword").focus();
        }).modal("show");

        // Cache jQuery objects once the dialog box is shown.
        emailChangeRequestForm = $("#emailChangeRequestForm");

        emailChangeRequestForm.defaultButton("#emailChangeRequestButton");

        // Set up validation for the form.
        emailChangeRequestForm.validate({
            rules: {
                emailChangeRequestCaptcha: {
                    required: true,
                    backbone: {
                        model: Captcha,
                        data: function() {
                            return {
                                response: $("#emailChangeRequestCaptcha").val()
                            };
                        },
                        settings: {
                            url: "/captcha/validate"
                        }
                    }
                }
            },
            messages: {
                emailChangeRequestCaptcha: {
                    required: "You must type in the characters as shown.",
                    backbone: "The characters you typed do not match the image."
                }
            },
            errorContainer: "#emailChangeRequestErrorList",
            errorLabelContainer: "#emailChangeRequestErrors"
        });

        // Setup request email change button.
        $("#emailChangeRequestButton").on("click", function() {
            var user;

            if (emailChangeRequestForm.valid()) {
                emailChangeRequestForm.find("input, button").attr("disabled", "");
                user = new User();
                user.fetch({
                    url: "/user/change-email",
                    data: JSON.stringify({
                        password: $("#emailChangeRequestPassword").val(),
                        captcha: $("#emailChangeRequestCaptcha").val()
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
                        $("#emailChangeRequestServerErrors").html(message);
                        $("#emailChangeRequestServerErrorList").show();
                        emailChangeRequestForm.find("input, button").removeAttr("disabled");

                        // Reload the captcha image.
                        $("#emailChangeRequestCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                        $("#emailChangeRequestCaptcha").val("");
                        emailChangeRequestForm.validate().element("#emailChangeRequestCaptcha");
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
            $("#changePasswordCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
            $("#changePasswordOldPassword").focus();
        }).modal("show");

        // Cache jQuery objects once the dialog box is shown.
        changePasswordForm = $("#changePasswordForm");

        changePasswordForm.defaultButton("#changePasswordButton");

        // Set up validation for the form.
        changePasswordForm.validate({
            rules: {
                changePasswordOldPassword: {
                    required: true
                },
                changePasswordNewPassword: {
                    required: true,
                    minlength: 6
                },
                changePasswordRetypePassword: {
                    equalTo: "#changePasswordNewPassword"
                },
                changePasswordCaptcha: {
                    required: true,
                    backbone: {
                        model: Captcha,
                        data: function() {
                            return {
                                response: $("#changePasswordCaptcha").val()
                            };
                        },
                        settings: {
                            url: "/captcha/validate"
                        }
                    }
                }
            },
            messages: {
                changePasswordOldPassword: {
                    required: "You must enter your current password."
                },
                changePasswordNewPassword: {
                    required: "You must enter a new password.",
                    minlength: "Your new password must be at least 6 characters."
                },
                changePasswordRetypePassword: {
                    equalTo: "The passwords you entered don't match."
                },
                changePasswordCaptcha: {
                    required: "You must type in the characters as shown.",
                    backbone: "The characters you typed do not match the image."
                }
            },
            errorContainer: "#changePasswordErrorList",
            errorLabelContainer: "#changePasswordErrors"
        });

        // Setup change password button.
        $("#changePasswordButton").on("click", function() {
            var user;

            if (changePasswordForm.valid()) {
                changePasswordForm.find("input, button").attr("disabled", "");
                user = new User();
                user.fetch({
                    url: "/user/change-password",
                    data: JSON.stringify({
                        oldPassword: $("#changePasswordOldPassword").val(),
                        newPassword: $("#changePasswordNewPassword").val(),
                        captcha: $("#changePasswordCaptcha").val()
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
                        $("#changePasswordServerErrors").html(message);
                        $("#changePasswordServerErrorList").show();
                        changePasswordForm.find("input, button").removeAttr("disabled");

                        // Reload the captcha image.
                        $("#changePasswordCaptchaImage").attr("src", "/images/captcha.png?_=" + new Date().getTime());
                        $("#changePasswordCaptcha").val("");
                        changePasswordForm.validate().element("#changePasswordCaptcha");
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
            $("#changeAliasAlias").focus();
        }).modal("show");

        // Cache jQuery objects once the dialog box is shown.
        changeAliasForm = $("#changeAliasForm");

        changeAliasForm.defaultButton("#changeAliasButton");

        // Set up validation for the form.
        changeAliasForm.validate({
            rules: {
                changeAliasAlias: {
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
                }
            },
            messages: {
                changeAliasAlias: {
                    required: "You must enter an alias.",
                    minlength: "Your alias must be at least 3 characters.",
                    backbone: "The alias you entered is already in use."
                }
            },
            errorContainer: "#changeAliasErrorList",
            errorLabelContainer: "#changeAliasErrors"
        });

        // Setup change alias button.
        $("#changeAliasButton").on("click", function() {
            var alias = $("#changeAliasAlias").val(),
                user;

            if (changeAliasForm.valid()) {
                changeAliasForm.find("input, button").attr("disabled", "");
                user = new User();
                user.fetch({
                    url: "/user/change-alias",
                    data: JSON.stringify({alias: alias}),
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    success: function() {
                        bootbox.hideAll();

                        $("#loggedInUserAlias").text(alias);
                        $("#accountAlias").text(alias);

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
                        $("#changeAliasServerErrors").html(message);
                        $("#changeAliasServerErrorList").show();
                        changeAliasForm.find("input, button").removeAttr("disabled");
                    }
                });
            }
        });
    }
});

module.exports.id = "account/index";
