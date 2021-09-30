/**
 * @typedef {{[x: string]: string}} Validation
 */

//   ###   #                                  #####                  #     ##
//  #   #  #                                  #                             #
//  #      # ##    ###   # ##    ## #   ###   #      ## #    ###    ##      #
//  #      ##  #      #  ##  #  #  #   #   #  ####   # # #      #    #      #
//  #      #   #   ####  #   #   ##    #####  #      # # #   ####    #      #
//  #   #  #   #  #   #  #   #  #      #      #      # # #  #   #    #      #
//   ###   #   #   ####  #   #   ###    ###   #####  #   #   ####   ###    ###
//                              #   #
//                               ###
/**
 * A class that handles the change email page.
 */
class ChangeEmail {
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
        /** @type {Validation} */
        const changeValidation = {};

        document.getElementById("change-email-panel").addEventListener("keyup", (kev) => {
            if (document.activeElement.id === "change-button" || kev.key !== "Enter") {
                return;
            }
            document.getElementById("change-button").click();
        });

        document.getElementById("change-button").addEventListener("click", async () => {
            const changeEmail = /** @type {HTMLInputElement} */(document.getElementById("change-email")); // eslint-disable-line no-extra-parens

            // Email validation.
            if (changeEmail.value.length === 0) {
                changeValidation["change-email"] = "You must enter your email address.";
            } else if (changeEmail.value.length > 256) {
                changeValidation["change-email"] = "Your email address must be at most 256 characters.";
            } else if (!ChangeEmail.Index.emailRegex.test(changeEmail.value)) { // eslint-disable-line no-negated-condition
                changeValidation["change-email"] = "You must enter a valid email address.";
            } else {
                delete changeValidation["change-email"];
                document.getElementById("change-email").classList.remove("error");
            }

            // Clear change validation.
            delete changeValidation["change-button"];

            // Update validation element.
            await ChangeEmail.Index.updateValidation("change-errors", changeValidation);

            // If there are no validation errors, attempt to proceed.
            if (Object.keys(changeValidation).length === 0) {
                ChangeEmail.Index.loading(true);

                try {
                    // Change email on the server.
                    const res = await fetch("/api/change-email", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: changeEmail.value
                        })
                    });

                    // Handle error responses.
                    if (res.status === 422) {
                        const body = await res.json();
                        for (const key of Object.keys(body.validation)) {
                            changeValidation[key] = body.validation[key];
                        }
                    } else if (res.status === 302) {
                        changeValidation["change-button"] = "This email change request has expired, please submit a new request via the Account link in the top right.";
                    } else if (res.status !== 204) {
                        changeValidation["change-button"] = "There was an error while trying to change your email address, please try again.";
                    }
                } catch (err) {
                    console.log(err);
                    changeValidation["change-button"] = "There was an error while trying to change your email address, please try again.";
                }

                // If there are any validation errors, update the validation element and hide the loading image.
                if (Object.keys(changeValidation).length > 0) {
                    await ChangeEmail.Index.updateValidation("change-errors", changeValidation);

                    ChangeEmail.Index.loading(false);

                    return;
                }

                window.location.href = "/?go=changeEmailSuccess";
            }
        });
    }
}

/** @type {typeof import("./index")} */
// @ts-ignore
ChangeEmail.Index = typeof Index === "undefined" ? require("./index") : Index; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", ChangeEmail.DOMContentLoaded);

if (typeof module === "undefined") {
    window.ChangeEmail = ChangeEmail;
} else {
    module.exports = ChangeEmail; // eslint-disable-line no-undef
}
