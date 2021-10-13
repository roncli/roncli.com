//    #                                        #
//   # #                                       #
//  #   #   ###    ###    ###   #   #  # ##   ####
//  #   #  #   #  #   #  #   #  #   #  ##  #   #
//  #####  #      #      #   #  #   #  #   #   #
//  #   #  #   #  #   #  #   #  #  ##  #   #   #  #
//  #   #   ###    ###    ###    ## #  #   #    ##
/**
 * A class that handles the account page.
 */
class Account {
    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page.
     * @returns {void}
     */
    static DOMContentLoaded() {
        document.getElementById("change-email").addEventListener("click", async () => {
            /** @type {{[x: string]: string}} */
            const changeValidation = {};

            await Account.Template.loadTemplate("/views/account/changeEmail.js", "AccountChangeEmailView");

            Account.modal = new Account.Modal();

            Account.modal.display("<h1>Request Email Change</h1>", window.AccountChangeEmailView.get());

            document.getElementById("changeEmail-modal").addEventListener("keyup", (kev) => {
                if (document.activeElement.id === "changeEmail-button" || kev.key !== "Enter") {
                    return;
                }
                document.getElementById("changeEmail-button").click();
            });

            document.getElementById("changeEmail-button").addEventListener("click", async () => {
                const changePassword = /** @type {HTMLInputElement} */(document.getElementById("changeEmail-password")), // eslint-disable-line no-extra-parens
                    changeCaptcha = /** @type {HTMLInputElement} */(document.getElementById("changeEmail-captcha")), // eslint-disable-line no-extra-parens
                    changeModal = /** @type {HTMLDivElement} */(document.getElementById("changeEmail-modal")), // eslint-disable-line no-extra-parens
                    changeLoading = /** @type {HTMLDivElement} */(document.getElementById("changeEmail-loading")); // eslint-disable-line no-extra-parens

                if (changePassword.value.length === 0) {
                    changeValidation["changeEmail-password"] = "You must enter your password.";
                } else if (changePassword.value.length < 6) {
                    changeValidation["changeEmail-password"] = "Your password must be at least 6 characters.";
                } else if (changePassword.value.length > 32) {
                    changeValidation["changeEmail-password"] = "Your password must be at most 32 characters.";
                } else {
                    delete changeValidation["changeEmail-password"];
                    document.getElementById("changeEmail-password").classList.remove("error");
                }

                // Captcha validation.
                if (changeCaptcha.value.length === 0) {
                    changeValidation["changeEmail-captcha"] = "You must enter the characters shown below the form.";
                } else {
                    delete changeValidation["changeEmail-captcha"];
                    document.getElementById("changeEmail-captcha").classList.remove("error");
                }

                // Clear change validation.
                delete changeValidation["changeEmail-button"];

                // Update validation element.
                await Account.Index.updateValidation("changeEmail-errors", changeValidation);

                // If there are no validation errors, attempt to proceed.
                if (Object.keys(changeValidation).length === 0) {
                    // Show loading image.
                    changeModal.classList.add("hidden");
                    changeLoading.classList.remove("hidden");

                    try {
                        // Request email change on the server.
                        const res = await fetch("/api/request-email-change", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                password: changePassword.value,
                                captcha: changeCaptcha.value
                            })
                        });

                        // Handle error responses.
                        if (res.status === 422) {
                            const body = await res.json();
                            for (const key of Object.keys(body.validation)) {
                                changeValidation[key] = body.validation[key];
                            }
                        } else if (res.status === 401) {
                            changeValidation["changeEmail-button"] = "There was an error retrieving your user account.  Please log out and log in again using the link in the upper right.";
                        } else if (res.status !== 204) {
                            changeValidation["changeEmail-button"] = "There was an error while trying to change your password, please try again.";
                        }
                    } catch (err) {
                        changeValidation["changeEmail-button"] = "There was an error while trying to change your password, please try again.";
                    }

                    // If there are any validation errors, update the validation element and hide the loading image.
                    if (Object.keys(changeValidation).length > 0) {
                        await Account.Index.updateValidation("changeEmail-errors", changeValidation);

                        changeLoading.classList.add("hidden");
                        changeModal.classList.remove("hidden");
                        return;
                    }

                    // Close modal.
                    Account.modal.close();

                    // Load email change request sent modal.

                    await Account.Index.showModal("Email Change Request Sent", "You must validate your current email address before you can change it to a new address.  Please check your email at your current address and follow the link to change your account's email address.  Be sure to check your spam folder for the email.");
                }
            });
        });

        document.getElementById("change-alias").addEventListener("click", async () => {
            /** @type {{[x: string]: string}} */
            const changeValidation = {};

            await Account.Template.loadTemplate("/views/account/changeAlias.js", "AccountChangeAliasView");

            Account.modal = new Account.Modal();

            Account.modal.display("<h1>Change Your Alias</h1>", window.AccountChangeAliasView.get());

            document.getElementById("changeAlias-modal").addEventListener("keyup", (kev) => {
                if (document.activeElement.id === "changeAlias-button" || kev.key !== "Enter") {
                    return;
                }
                document.getElementById("changeAlias-button").click();
            });

            document.getElementById("changeAlias-button").addEventListener("click", async () => {
                const changeAlias = /** @type {HTMLInputElement} */(document.getElementById("changeAlias-alias")), // eslint-disable-line no-extra-parens
                    changeModal = /** @type {HTMLDivElement} */(document.getElementById("changeAlias-modal")), // eslint-disable-line no-extra-parens
                    changeLoading = /** @type {HTMLDivElement} */(document.getElementById("changeAlias-loading")); // eslint-disable-line no-extra-parens

                // Alias validation.
                if (changeAlias.value.length === 0) {
                    changeValidation["changeAlias-alias"] = "You must enter an alias.";
                } else if (changeAlias.value.length < 3) {
                    changeValidation["changeAlias-alias"] = "Your alias must be at least 3 characters.";
                } else if (changeAlias.value.length > 50) {
                    changeValidation["changeAlias-alias"] = "Your alias must be at most 50 characters.";
                } else {
                    delete changeValidation["changeAlias-alias"];
                    document.getElementById("changeAlias-alias").classList.remove("error");
                }

                // Clear change validation.
                delete changeValidation["changeAlias-button"];

                // Update validation element.
                await Account.Index.updateValidation("changeAlias-errors", changeValidation);

                // If there are no validation errors, attempt to proceed.
                if (Object.keys(changeValidation).length === 0) {
                    // Show loading image.
                    changeModal.classList.add("hidden");
                    changeLoading.classList.remove("hidden");

                    try {
                        // Change password on the server.
                        const res = await fetch("/api/change-alias", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                alias: changeAlias.value
                            })
                        });

                        // Handle error responses.
                        if (res.status === 422) {
                            const body = await res.json();
                            for (const key of Object.keys(body.validation)) {
                                changeValidation[key] = body.validation[key];
                            }
                        } else if (res.status === 401) {
                            changeValidation["changeAlias-button"] = "There was an error retrieving your user account.  Please log out and log in again using the link in the upper right.";
                        } else if (res.status !== 204) {
                            changeValidation["changeAlias-button"] = "There was an error while trying to change your alias, please try again.";
                        }
                    } catch (err) {
                        changeValidation["changeAlias-button"] = "There was an error while trying to change your alias, please try again.";
                    }

                    // If there are any validation errors, update the validation element and hide the loading image.
                    if (Object.keys(changeValidation).length > 0) {
                        await Account.Index.updateValidation("changeAlias-errors", changeValidation);

                        changeLoading.classList.add("hidden");
                        changeModal.classList.remove("hidden");
                        return;
                    }

                    // Change the alias.
                    document.getElementById("alias").innerText = changeAlias.value;
                    document.getElementById("account-alias").innerText = changeAlias.value;
                    Account.modal.close();
                }
            });
        });

        document.getElementById("change-password").addEventListener("click", async () => {
            /** @type {{[x: string]: string}} */
            const changeValidation = {};

            await Account.Template.loadTemplate("/views/account/changePassword.js", "AccountChangePasswordView");

            Account.modal = new Account.Modal();

            Account.modal.display("<h1>Change Your Password</h1>", window.AccountChangePasswordView.get());

            document.getElementById("changePassword-modal").addEventListener("keyup", (kev) => {
                if (document.activeElement.id === "changePassword-button" || kev.key !== "Enter") {
                    return;
                }
                document.getElementById("changePassword-button").click();
            });

            document.getElementById("changePassword-button").addEventListener("click", async () => {
                const changeCurrentPassword = /** @type {HTMLInputElement} */(document.getElementById("changePassword-current-password")), // eslint-disable-line no-extra-parens
                    changeNewPassword = /** @type {HTMLInputElement} */(document.getElementById("changePassword-new-password")), // eslint-disable-line no-extra-parens
                    changeRetypePassword = /** @type {HTMLInputElement} */(document.getElementById("changePassword-retype-password")), // eslint-disable-line no-extra-parens
                    changeCaptcha = /** @type {HTMLInputElement} */(document.getElementById("changePassword-captcha")), // eslint-disable-line no-extra-parens
                    changeModal = /** @type {HTMLDivElement} */(document.getElementById("changePassword-modal")), // eslint-disable-line no-extra-parens
                    changeLoading = /** @type {HTMLDivElement} */(document.getElementById("changePassword-loading")); // eslint-disable-line no-extra-parens

                // Current password validation.
                if (changeCurrentPassword.value.length === 0) {
                    changeValidation["changePassword-current-password"] = "You must enter your current password.";
                } else if (changeCurrentPassword.value.length < 6) {
                    changeValidation["changePassword-current-password"] = "Your current password must be at least 6 characters.";
                } else if (changeCurrentPassword.value.length > 32) {
                    changeValidation["changePassword-current-password"] = "Your current password must be at most 32 characters.";
                } else {
                    delete changeValidation["changePassword-current-password"];
                    document.getElementById("changePassword-current-password").classList.remove("error");
                }

                // New password validation.
                if (changeNewPassword.value.length === 0) {
                    changeValidation["changePassword-new-password"] = "You must enter a new password.";
                } else if (changeNewPassword.value.length < 6) {
                    changeValidation["changePassword-new-password"] = "Your new password must be at least 6 characters.";
                } else if (changeNewPassword.value.length > 32) {
                    changeValidation["changePassword-new-password"] = "Your new password must be at most 32 characters.";
                } else {
                    delete changeValidation["changePassword-new-password"];
                    document.getElementById("changePassword-new-password").classList.remove("error");
                }

                // Retype password validation.
                if (changeRetypePassword.value !== changeNewPassword.value) { // eslint-disable-line no-negated-condition
                    changeValidation["changePassword-retype-password"] = "Your new passwords must match.";
                } else {
                    delete changeValidation["changePassword-retype-password"];
                    document.getElementById("changePassword-retype-password").classList.remove("error");
                }

                // Captcha validation.
                if (changeCaptcha.value.length === 0) {
                    changeValidation["changePassword-captcha"] = "You must enter the characters shown below the form.";
                } else {
                    delete changeValidation["changePassword-captcha"];
                    document.getElementById("changePassword-captcha").classList.remove("error");
                }

                // Clear change validation.
                delete changeValidation["changePassword-button"];

                // Update validation element.
                await Account.Index.updateValidation("changePassword-errors", changeValidation);

                // If there are no validation errors, attempt to proceed.
                if (Object.keys(changeValidation).length === 0) {
                    // Show loading image.
                    changeModal.classList.add("hidden");
                    changeLoading.classList.remove("hidden");

                    try {
                        // Change password on the server.
                        const res = await fetch("/api/change-password", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                oldPassword: changeCurrentPassword.value,
                                password: changeNewPassword.value,
                                retypePassword: changeRetypePassword.value,
                                captcha: changeCaptcha.value
                            })
                        });

                        // Handle error responses.
                        if (res.status === 422) {
                            const body = await res.json();
                            for (const key of Object.keys(body.validation)) {
                                changeValidation[key] = body.validation[key];
                            }
                        } else if (res.status === 401) {
                            changeValidation["changePassword-button"] = "There was an error retrieving your user account.  Please log out and log in again using the link in the upper right.";
                        } else if (res.status !== 204) {
                            changeValidation["changePassword-button"] = "There was an error while trying to change your password, please try again.";
                        }
                    } catch (err) {
                        changeValidation["changePassword-button"] = "There was an error while trying to change your password, please try again.";
                    }

                    // If there are any validation errors, update the validation element and hide the loading image.
                    if (Object.keys(changeValidation).length > 0) {
                        await Account.Index.updateValidation("changePassword-errors", changeValidation);

                        changeLoading.classList.add("hidden");
                        changeModal.classList.remove("hidden");
                        return;
                    }

                    // Log out and redirect to login.
                    Account.Index.displayUser();
                    window.location.href = "/?go=changePasswordSuccess";
                }
            });
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
Account.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

/** @type {typeof import("./common/modal")} */
// @ts-ignore
Account.Modal = typeof Modal === "undefined" ? require("./common/modal") : Modal; // eslint-disable-line no-undef

/** @type {import("./common/modal")} */
Account.modal = null;

/** @type {typeof import("./common/template")} */
// @ts-ignore
Account.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", Account.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Account = Account;
} else {
    module.exports = Account; // eslint-disable-line no-undef
}
