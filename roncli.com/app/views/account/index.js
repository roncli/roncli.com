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
            $("#emailChangeRequestCaptchaImage").attr("src", "/images/captcha.png");
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
            var emailChangeRequestButton = $(this),
                user;

            if (emailChangeRequestForm.valid()) {
                emailChangeRequestButton.attr("disabled", "");
                user = new User();
                user.fetch({
                    url: "/user/email-change-request",
                    data: JSON.stringify({
                        userId: view.app.user.userId,
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
                        emailChangeRequestButton.removeAttr("disabled");

                        // Reload the captcha image.
                        $("#emailChangeRequestCaptchaImage").attr("src", "/images/captcha.png");
                        $("#emailChangeRequestCaptcha").val("");
                        emailChangeRequestForm.validate().element("#emailChangeRequestCaptcha");
                    }
                });
            }
        });
    },

    changePassword: function() {
        "use strict";

        alert("Change Password");
    },

    changeAlias: function() {
        "use strict";

        alert("Change Alias");
    }
});

module.exports.id = "account/index";
