//   ###   #                                  ####                                                 #
//  #   #  #                                  #   #                                                #
//  #      # ##    ###   # ##    ## #   ###   #   #   ###    ###    ###   #   #   ###   # ##    ## #
//  #      ##  #      #  ##  #  #  #   #   #  ####       #  #      #      #   #  #   #  ##  #  #  ##
//  #      #   #   ####  #   #   ##    #####  #       ####   ###    ###   # # #  #   #  #      #   #
//  #   #  #   #  #   #  #   #  #      #      #      #   #      #      #  # # #  #   #  #      #  ##
//   ###   #   #   ####  #   #   ###    ###   #       ####  ####   ####    # #    ###   #       ## #
//                              #   #
//                               ###
/**
 * A class that handles the change password page.
 */
class ChangePassword {
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
        /** @type {{[x: string]: string}} */
        const changeValidation = {};

        document.getElementById("change-password-panel").addEventListener("keyup", (kev) => {
            if (document.activeElement.id === "change-button" || kev.key !== "Enter") {
                return;
            }
            document.getElementById("change-button").click();
        });

        document.getElementById("change-button").addEventListener("click", async () => {
            const changePassword = /** @type {HTMLInputElement} */(document.getElementById("change-password")), // eslint-disable-line no-extra-parens
                changeRetypePassword = /** @type {HTMLInputElement} */(document.getElementById("change-retype-password")); // eslint-disable-line no-extra-parens

            // Password validation.
            if (changePassword.value.length === 0) {
                changeValidation["change-password"] = "You must enter a password.";
            } else if (changePassword.value.length < 6) {
                changeValidation["change-password"] = "Your password must be at least 6 characters.";
            } else if (changePassword.value.length > 32) {
                changeValidation["change-password"] = "Your password must be at most 32 characters.";
            } else {
                delete changeValidation["change-password"];
                document.getElementById("change-password").classList.remove("error");
            }

            // Retype password validation.
            if (changeRetypePassword.value !== changePassword.value) { // eslint-disable-line no-negated-condition
                changeValidation["change-retype-password"] = "Your passwords must match.";
            } else {
                delete changeValidation["change-retype-password"];
                document.getElementById("change-retype-password").classList.remove("error");
            }

            // Clear change validation.
            delete changeValidation["change-button"];

            // Update validation element.
            await ChangePassword.Index.updateValidation("change-errors", changeValidation);

            // If there are no validation errors, attempt to proceed.
            if (Object.keys(changeValidation).length === 0) {
                ChangePassword.Index.loading(true);

                try {
                    // Change password on the server.
                    const res = await fetch("/api/change-password", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            password: changePassword.value,
                            retypePassword: changeRetypePassword.value
                        })
                    });

                    // Handle error responses.
                    if (res.status === 422) {
                        const body = await res.json();
                        for (const key of Object.keys(body.validation)) {
                            changeValidation[key] = body.validation[key];
                        }
                    } else if (res.status === 302) {
                        changeValidation["change-button"] = "This password change request has expired, please submit a new request via the Login link in the top right.";
                    } else if (res.status !== 204) {
                        changeValidation["change-button"] = "There was an error while trying to change your password, please try again.";
                    }
                } catch (err) {
                    changeValidation["change-button"] = "There was an error while trying to change your password, please try again.";
                }

                // If there are any validation errors, update the validation element and hide the loading image.
                if (Object.keys(changeValidation).length > 0) {
                    await ChangePassword.Index.updateValidation("change-errors", changeValidation);

                    ChangePassword.Index.loading(false);

                    return;
                }

                window.location.href = "/?go=changePasswordSuccess";
            }
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
ChangePassword.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", ChangePassword.DOMContentLoaded);

if (typeof module === "undefined") {
    window.ChangePassword = ChangePassword;
} else {
    module.exports = ChangePassword; // eslint-disable-line no-undef
}
