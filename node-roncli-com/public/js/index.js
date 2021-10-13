/**
 * @typedef {import("../../types/browser/mediaTypes").Media} MediaTypes.Media
 * @typedef {import("../../src/models/user")} User
 */

//   ###              #
//    #               #
//    #    # ##    ## #   ###   #   #
//    #    ##  #  #  ##  #   #   # #
//    #    #   #  #   #  #####    #
//    #    #   #  #  ##  #       # #
//   ###   #   #   ## #   ###   #   #
/**
 * A class that handles common web site elements.
 */
class Index {
    //          #     #  ###         ###   ##                ##     #            #
    //          #     #   #          #  #   #                 #                  #
    //  ###   ###   ###   #     ##   #  #   #     ###  #  #   #    ##     ###   ###
    // #  #  #  #  #  #   #    #  #  ###    #    #  #  #  #   #     #    ##      #
    // # ##  #  #  #  #   #    #  #  #      #    # ##   # #   #     #      ##    #
    //  # #   ###   ###   #     ##   #     ###    # #    #   ###   ###   ###      ##
    //                                                  #
    /**
     * Adds media to the playlist.
     * @param {string} source The source of the song, such as "soundcloud" or "youtube".
     * @param {string} url The URL of the media.
     * @returns {Promise} A promise that resolves when the track has been added to the playlist.
     */
    static async addToPlaylist(source, url) {
        try {
            /** @type {MediaTypes.Media} */
            let media = {source, url};

            if (this.mediaPlayer.adding) {
                this.mediaPlayer.toAdd.push(media);
                return;
            }

            while (media) {
                this.mediaPlayer.adding = true;

                switch (source) {
                    case "soundcloud":
                        {
                            // Get the track ID.
                            const matches = Index.soundcloudRegex.exec(media.url);

                            if (!matches || matches.length < 2) {
                                // Invalid audio.
                                throw new Error("Invalid Soundcloud track.");
                            }
                            media.trackId = matches.groups.trackId;
                            media.view = "SoundcloudView";

                            const res = await fetch(`/api/soundcloud/${media.trackId}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            });

                            if (res.status !== 200) {
                                throw new Error("Soundcloud track not found.");
                            }

                            let data;
                            try {
                                data = await res.json();
                            } catch (err) {
                                throw new Error("Error getting Soundcloud track.");
                            }

                            media.title = `${data.username} - ${data.title}`;
                            media.resolvedUrl = data.uri;
                        }
                        break;
                    case "youtube":
                        {
                            // Get the video ID.
                            const matches = Index.youtubeRegex.exec(media.url);

                            if (!matches || matches.length < 2) {
                                // Invalid video.
                                throw new Error("Invalid YouTube video.");
                            }
                            media.videoId = matches.groups.videoId;
                            media.origin = window.location.origin;
                            media.view = "YouTubeView";

                            const res = await fetch(`/api/youtube/${media.videoId}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            });

                            if (res.status !== 200) {
                                throw new Error("YouTube track not found.");
                            }

                            let data;
                            try {
                                data = await res.json();
                            } catch (err) {
                                throw new Error("Error getting YouTube track.");
                            }

                            media.title = `${data.channelTitle} - ${data.title}`;
                        }
                        break;
                    default:
                        throw new Error("Invalid media format.");
                }

                await Index.Template.loadTemplate("/views/media/media.js", "MediaView");

                document.getElementById("media-player-playlist").insertAdjacentHTML("beforeend", Index.Template.renderTemplate(media, window.MediaView.get));
                Index.mediaPlayer.playlist.push(media);

                if (!Index.mediaPlayer.playing) {
                    Index.play(Index.mediaPlayer.playlist.length - 1);
                }

                if (Index.mediaPlayer.toAdd.length > 0) {
                    media = Index.mediaPlayer.toAdd.shift();
                } else {
                    media = void 0;
                }
            }
        } catch (err) {
            await Index.Template.loadTemplate("/views/media/addError.js", "AddErrorView");

            Index.modal = new Index.Modal();

            Index.modal.display("<h1>Error Adding to Playlist</h1>", window.AddErrorView.get(err));

            document.querySelector("#modal .ok").addEventListener("click", () => {
                Index.modal.close();
            });

            Index.mediaPlayer.toAdd.splice(0, Index.mediaPlayer.toAdd.length);
        }

        this.mediaPlayer.adding = false;
    }

    //    #   #                 ##                #  #
    //    #                      #                #  #
    //  ###  ##     ###   ###    #     ###  #  #  #  #   ###    ##   ###
    // #  #   #    ##     #  #   #    #  #  #  #  #  #  ##     # ##  #  #
    // #  #   #      ##   #  #   #    # ##   # #  #  #    ##   ##    #
    //  ###  ###   ###    ###   ###    # #    #    ##   ###     ##   #
    //                    #                  #
    /**
     * Displays the user menu options.
     * @param {User} [user] The user to display.
     * @param {{title: string, href: string}[]} [userLinks] The links to show on the login page.
     * @returns {Promise} A promise that resolves when the user has been displayed.
     */
    static async displayUser(user, userLinks) {
        Index.user = user;
        for (const login of Array.from(document.querySelectorAll("li.login"))) {
            login.parentNode.removeChild(login);
        }
        await Index.Template.loadTemplate("/views/index/user.js", "UserView");
        document.querySelector("#menu ul").insertAdjacentHTML("beforeend", Index.Template.renderTemplate({user, userLinks}, window.UserView.get));
    }

    // ##                   #   #
    //  #                   #
    //  #     ##    ###   ###  ##    ###    ###
    //  #    #  #  #  #  #  #   #    #  #  #  #
    //  #    #  #  # ##  #  #   #    #  #   ##
    // ###    ##    # #   ###  ###   #  #  #
    //                                      ###
    /**
     * Show or hide the loading image.
     * @param {boolean} loading Whether to show or hide the loading image.
     * @returns {void}
     */
    static loading(loading) {
        if (loading) {
            document.getElementById("page-html").classList.add("hidden");
            document.getElementById("loading").classList.remove("hidden");
        } else {
            document.getElementById("page-html").classList.remove("hidden");
            document.getElementById("loading").classList.add("hidden");
        }
    }

    //       ##
    //        #
    // ###    #     ###  #  #
    // #  #   #    #  #  #  #
    // #  #   #    # ##   # #
    // ###   ###    # #    #
    // #                  #
    /**
     * Plays media from the playlist.
     * @param {number} playlistIndex The index of the playlist to play.
     * @returns {Promise} A promise that resolves when the media is played.
     */
    static async play(playlistIndex) {
        var media = this.mediaPlayer.playlist[playlistIndex],
            items = document.querySelectorAll("div.media-player-item"),
            player = document.getElementById("media-player-content-player"),
            nowPlaying = document.getElementById("media-player-now-playing");

        if (!media) {
            return;
        }

        Index.mediaPlayer.currentIndex = playlistIndex;
        Index.mediaPlayer.currentSource = media.source;
        Index.mediaPlayer.playing = true;

        items.forEach((item) => {
            item.classList.remove("active");
        });

        items[playlistIndex].classList.add("active");

        player.innerHTML = "";

        nowPlaying.innerText = media.title;

        media.id = `media-player-${media.source}`;

        await Index.Template.loadTemplate(`/views/media/${media.source}.js`, media.view);

        player.innerHTML = Index.Template.renderTemplate(media, /** @type {any} */(window[media.view]).get); // eslint-disable-line no-extra-parens
        player.style.display = "block";

        switch (media.source) {
            case "soundcloud":
                Index.widget = window.SC.Widget("media-player-soundcloud");

                Index.widget.bind(window.SC.Widget.Events.PAUSE, function() {
                    player.style.display = "none";
                    Index.mediaPlayer.playing = false;
                });

                Index.widget.bind(window.SC.Widget.Events.PLAY, function() {
                    setTimeout(function() {
                        if (Index.mediaPlayer.playing) {
                            player.style.display = "block";
                        }
                    }, 500);
                    Index.mediaPlayer.playing = true;
                });

                Index.widget.bind(window.SC.Widget.Events.FINISH, function() {
                    player.style.display = "none";
                    Index.mediaPlayer.playing = false;
                    if (Index.mediaPlayer.currentIndex < Index.mediaPlayer.playlist.length - 1) {
                        Index.play(Index.mediaPlayer.currentIndex + 1);
                    } else {
                        Index.mediaPlayer.currentSource = void 0;
                    }
                });
                break;
            case "youtube":
                Index.widget = new window.YT.Player("media-player-youtube");

                Index.widget.addEventListener("onStateChange", function(event) {
                    switch (event.data) {
                        case window.YT.PlayerState.PAUSED:
                            player.style.display = "none";
                            Index.mediaPlayer.playing = false;
                            break;
                        case window.YT.PlayerState.PLAYING:
                            setTimeout(function() {
                                if (Index.mediaPlayer.playing) {
                                    player.style.display = "block";
                                }
                            }, 500);
                            Index.mediaPlayer.playing = true;
                            break;
                        case window.YT.PlayerState.ENDED:
                            player.style.display = "none";
                            Index.mediaPlayer.playing = false;
                            if (Index.mediaPlayer.currentIndex < Index.mediaPlayer.playlist.length - 1) {
                                Index.play(Index.mediaPlayer.currentIndex + 1);
                            } else {
                                Index.mediaPlayer.currentSource = void 0;
                            }
                            break;
                    }
                });
                break;
        }
    }

    //        #                 #  #           #        ##
    //        #                 ####           #         #
    //  ###   ###    ##   #  #  ####   ##    ###   ###   #
    // ##     #  #  #  #  #  #  #  #  #  #  #  #  #  #   #
    //   ##   #  #  #  #  ####  #  #  #  #  #  #  # ##   #
    // ###    #  #   ##   ####  #  #   ##    ###   # #  ###
    /**
     * Shows a generic modal.
     * @param {string} title The title of the modal.
     * @param {string} error The text of the modal.
     * @returns {Promise} A promise that resolves when the modal has been shown.
     */
    static async showModal(title, error) {
        await Index.Template.loadTemplate("/views/index/modal.js", "ModalView");

        Index.modal = new Index.Modal();

        Index.modal.display(`<h1>${title}</h1>`, window.ModalView.get(error));

        document.querySelector("#modal .ok").addEventListener("click", () => {
            Index.modal.close();
        });
    }

    //                #         #          #  #        ##     #       #         #     #
    //                #         #          #  #         #             #         #
    // #  #  ###    ###   ###  ###    ##   #  #   ###   #    ##     ###   ###  ###   ##     ##   ###
    // #  #  #  #  #  #  #  #   #    # ##  #  #  #  #   #     #    #  #  #  #   #     #    #  #  #  #
    // #  #  #  #  #  #  # ##   #    ##     ##   # ##   #     #    #  #  # ##   #     #    #  #  #  #
    //  ###  ###    ###   # #    ##   ##    ##    # #  ###   ###    ###   # #    ##  ###    ##   #  #
    //       #
    /**
     * Updates the validation for the login form.
     * @param {string} id The element ID to update the validation with.
     * @param {{[x: string]: string}} validation The results of the validation.
     * @returns {Promise} A promise that resolves when the validation has been updated.
     */
    static async updateValidation(id, validation) {
        const containerEl = document.getElementById(id);

        if (!containerEl) {
            return;
        }

        const keys = Object.keys(validation);

        if (keys.length === 0) {
            containerEl.innerHTML = "";
            return;
        }

        for (const key of keys) {
            const el = document.getElementById(key);

            if (el) {
                el.classList.add("error");
            } else {
                delete validation[key];
            }
        }

        await Index.Template.loadTemplate("/views/index/errorPanel.js", "ErrorPanelView");

        containerEl.innerHTML = Index.Template.renderTemplate(validation, window.ErrorPanelView.get);
    }

    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page.
     * @returns {Promise} A promise that resolves when the content is loaded.
     */
    static async DOMContentLoaded() {
        const trigger = document.getElementById("media-player-trigger"),
            triggerButton = document.getElementById("media-player-trigger-button"),
            panel = document.getElementById("media-player-panel"),
            contentPlayer = document.getElementById("media-player-content-player");

        // Show media player trigger.
        trigger.style.display = "block";

        // Open the media player.
        triggerButton.addEventListener("click", () => {
            trigger.classList.toggle("open");
            panel.classList.toggle("open");
        });

        document.addEventListener("click", async (ev) => {
            let el = /** @type {HTMLElement} */(ev.target); // eslint-disable-line no-extra-parens

            while (!el.classList.contains("add-to-media-player") && !el.classList.contains("media-player-item-play") && !el.classList.contains("media-player-item-remove") && el.id !== "log-in" && el.id !== "log-out") {
                el = /** @type {HTMLElement} */(el.parentNode); // eslint-disable-line no-extra-parens
                if (!el || !el.classList) {
                    return;
                }
            }

            ev.preventDefault();

            if (el.id === "log-in") {
                /** @type {{[x: string]: string}} */
                const loginValidation = {};

                /** @type {{[x: string]: string}} */
                const registerValidation = {};

                /** @type {{[x: string]: string}} */
                const recoverValidation = {};

                await Index.Template.loadTemplate("/views/index/login.js", "LoginView");

                Index.modal = new Index.Modal();

                Index.modal.display("<h1>Login</h1>", window.LoginView.get());

                const panelBody = /** @type {HTMLElement} */(document.querySelector("#modal div.panel-body")); // eslint-disable-line no-extra-parens

                panelBody.style.position = "relative";

                if (Index.validated) {
                    loginValidation["login-button"] = "Your account is now validated!  Please log in.";
                    await Index.updateValidation("login-errors", loginValidation);
                }

                if (Index.emailChangeAuthorized) {
                    loginValidation["login-button"] = "Your request to change your email address is now validated!  Please log in with your old email address.";
                    await Index.updateValidation("login-errors", loginValidation);
                }

                if (Index.emailChanged) {
                    loginValidation["login-button"] = "Your new email address is now validated!  Please log in with your new email address.";
                    await Index.updateValidation("login-errors", loginValidation);
                }

                if (Index.changePasswordSuccess) {
                    loginValidation["login-button"] = "Your password has been changed!  Please log in with your new password.";
                    await Index.updateValidation("login-errors", loginValidation);
                }

                document.getElementById("login-email").focus();

                document.getElementById("section-login").addEventListener("keyup", (kev) => {
                    if (document.activeElement.id === "login-button" || kev.key !== "Enter") {
                        return;
                    }
                    document.getElementById("login-button").click();
                });

                document.getElementById("section-register").addEventListener("keyup", (kev) => {
                    if (document.activeElement.id === "register-button" || kev.key !== "Enter") {
                        return;
                    }
                    document.getElementById("register-button").click();
                });

                document.getElementById("section-recover").addEventListener("keyup", (kev) => {
                    if (document.activeElement.id === "recover-button" || kev.key !== "Enter") {
                        return;
                    }
                    document.getElementById("recover-button").click();
                });

                document.getElementById("login-button").addEventListener("click", async () => {
                    const loginEmail = /** @type {HTMLInputElement} */(document.getElementById("login-email")), // eslint-disable-line no-extra-parens
                        loginPassword = /** @type {HTMLInputElement} */(document.getElementById("login-password")), // eslint-disable-line no-extra-parens
                        loginSaveLogin = /** @type {HTMLInputElement} */(document.getElementById("login-save-login")), // eslint-disable-line no-extra-parens
                        loginModal = /** @type {HTMLDivElement} */(document.getElementById("login-modal")), // eslint-disable-line no-extra-parens
                        loginLoading = /** @type {HTMLDivElement} */(document.getElementById("login-loading")); // eslint-disable-line no-extra-parens

                    // Email validation.
                    if (loginEmail.value.length === 0) {
                        loginValidation["login-email"] = "You must enter your email address.";
                    } else if (loginEmail.value.length > 256) {
                        loginValidation["login-email"] = "Your email address must be at most 256 characters.";
                    } else if (!Index.emailRegex.test(loginEmail.value)) { // eslint-disable-line no-negated-condition
                        loginValidation["login-email"] = "You must enter a valid email address.";
                    } else {
                        delete loginValidation["login-email"];
                        document.getElementById("login-email").classList.remove("error");
                    }

                    // Password validation.
                    if (loginPassword.value.length === 0) {
                        loginValidation["login-password"] = "You must enter your password.";
                    } else if (loginPassword.value.length < 6) {
                        loginValidation["login-password"] = "Your password must be at least 6 characters.";
                    } else if (loginPassword.value.length > 32) {
                        loginValidation["login-password"] = "Your password must be at most 32 characters.";
                    } else {
                        delete loginValidation["login-password"];
                        document.getElementById("login-password").classList.remove("error");
                    }

                    // Clear login validation.
                    delete loginValidation["login-button"];

                    // Update validation element.
                    await Index.updateValidation("login-errors", loginValidation);

                    // If there are no validation errors, attempt to proceed.
                    if (Object.keys(loginValidation).length === 0) {
                        // Show loading image.
                        loginModal.classList.add("hidden");
                        loginLoading.classList.remove("hidden");

                        let data;

                        try {
                            // Login on the server.
                            const res = await fetch("/api/login", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    email: loginEmail.value,
                                    password: loginPassword.value,
                                    saveLogin: loginSaveLogin.checked
                                })
                            });

                            // Handle error responses.
                            if (res.status === 401) {
                                loginValidation["login-button"] = "Invalid email address or password.";
                            } else if (res.status === 403) {
                                loginValidation["login-button"] = "You have not yet validated your email address.  Please check your email for instructions on how to validate your registration.  Once you have validated, you may log in.";
                            } else if (res.status !== 200) {
                                loginValidation["login-button"] = "There was an error while trying to login, please try again.";
                            } else if (Index.emailChangeAuthorized) {
                                window.location.href = "/account/change-email";
                            }

                            data = await res.json();
                        } catch (err) {
                            loginValidation["login-button"] = "There was an error while trying to login, please try again.";
                        }

                        // If there are any validation errors, update the validation element and hide the loading image.
                        if (Object.keys(loginValidation).length > 0) {
                            await Index.updateValidation("login-errors", loginValidation);

                            loginLoading.classList.add("hidden");
                            loginModal.classList.remove("hidden");
                            return;
                        }

                        const statusCode = document.getElementById("status-code");

                        if (!data || statusCode && ["401", "404", "500"].indexOf(statusCode.innerText) !== -1) {
                            window.location.reload();
                            return;
                        }

                        // Get the user.
                        const user = data.user,
                            userLinks = data.userLinks;

                        // Display the user.
                        Index.displayUser(user, userLinks);

                        // Close the modal.
                        Index.modal.close();
                    }
                });

                document.getElementById("register-button").addEventListener("click", async () => {
                    const registerEmail = /** @type {HTMLInputElement} */(document.getElementById("register-email")), // eslint-disable-line no-extra-parens
                        registerPassword = /** @type {HTMLInputElement} */(document.getElementById("register-password")), // eslint-disable-line no-extra-parens
                        registerRetypePassword = /** @type {HTMLInputElement} */(document.getElementById("register-retype-password")), // eslint-disable-line no-extra-parens
                        registerAlias = /** @type {HTMLInputElement} */(document.getElementById("register-alias")), // eslint-disable-line no-extra-parens
                        registerDOB = /** @type {HTMLInputElement} */(document.getElementById("register-dob")), // eslint-disable-line no-extra-parens
                        registerCaptcha = /** @type {HTMLInputElement} */(document.getElementById("register-captcha")), // eslint-disable-line no-extra-parens
                        loginModal = /** @type {HTMLDivElement} */(document.getElementById("login-modal")), // eslint-disable-line no-extra-parens
                        loginLoading = /** @type {HTMLDivElement} */(document.getElementById("login-loading")); // eslint-disable-line no-extra-parens

                    // Email validation.
                    if (registerEmail.value.length === 0) {
                        registerValidation["register-email"] = "You must enter your email address.";
                    } else if (registerEmail.value.length > 256) {
                        registerValidation["register-email"] = "Your email address must be at most 256 characters.";
                    } else if (!Index.emailRegex.test(registerEmail.value)) { // eslint-disable-line no-negated-condition
                        registerValidation["register-email"] = "You must enter a valid email address.";
                    } else {
                        delete registerValidation["register-email"];
                        document.getElementById("register-email").classList.remove("error");
                    }

                    // Password validation.
                    if (registerPassword.value.length === 0) {
                        registerValidation["register-password"] = "You must enter a password.";
                    } else if (registerPassword.value.length < 6) {
                        registerValidation["register-password"] = "Your password must be at least 6 characters.";
                    } else if (registerPassword.value.length > 32) {
                        registerValidation["register-password"] = "Your password must be at most 32 characters.";
                    } else {
                        delete registerValidation["register-password"];
                        document.getElementById("register-password").classList.remove("error");
                    }

                    // Retype password validation.
                    if (registerRetypePassword.value !== registerPassword.value) { // eslint-disable-line no-negated-condition
                        registerValidation["register-retype-password"] = "Your passwords must match.";
                    } else {
                        delete registerValidation["register-retype-password"];
                        document.getElementById("register-retype-password").classList.remove("error");
                    }

                    // Alias validation.
                    if (registerAlias.value.length === 0) {
                        registerValidation["register-alias"] = "You must enter an alias.";
                    } else if (registerAlias.value.length < 3) {
                        registerValidation["register-alias"] = "Your alias must be at least 3 characters.";
                    } else if (registerAlias.value.length > 50) {
                        registerValidation["register-alias"] = "Your alias must be at most 50 characters.";
                    } else {
                        delete registerValidation["register-alias"];
                        document.getElementById("register-alias").classList.remove("error");
                    }

                    // DOB validation.
                    const now = new Date();
                    if (!registerDOB.valueAsDate) {
                        registerValidation["register-dob"] = "You must enter your date of birth.";
                    } else if (now.getFullYear() - registerDOB.valueAsDate.getFullYear() < 13 || now.getFullYear() - registerDOB.valueAsDate.getFullYear() === 13 && now.getMonth() < registerDOB.valueAsDate.getMonth() || now.getFullYear() - registerDOB.valueAsDate.getFullYear() === 13 && now.getMonth() === registerDOB.valueAsDate.getMonth() && now.getDate() < registerDOB.valueAsDate.getDate()) {
                        registerValidation["register-dob"] = "You must be at least 13 years old to register.";
                    } else if (registerDOB.valueAsDate.getFullYear() < 1900) {
                        registerValidation["register-dob"] = "You must enter a valid date of birth.";
                    } else {
                        delete registerValidation["register-dob"];
                        document.getElementById("register-dob").classList.remove("error");
                    }

                    // Captcha validation.
                    if (registerCaptcha.value.length === 0) {
                        registerValidation["register-captcha"] = "You must enter the characters shown below the form.";
                    } else {
                        delete registerValidation["register-captcha"];
                        document.getElementById("register-captcha").classList.remove("error");
                    }

                    // Clear register validation.
                    delete registerValidation["register-button"];

                    // Update validation element.
                    await Index.updateValidation("register-errors", registerValidation);

                    // If there are no validation errors, attempt to proceed.
                    if (Object.keys(registerValidation).length === 0) {
                        // Show loading image.
                        loginModal.classList.add("hidden");
                        loginLoading.classList.remove("hidden");

                        try {
                            // Register on the server.
                            const res = await fetch("/api/register", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    email: registerEmail.value,
                                    password: registerPassword.value,
                                    retypePassword: registerRetypePassword.value,
                                    alias: registerAlias.value,
                                    dob: registerDOB.valueAsDate,
                                    captcha: registerCaptcha.value
                                })
                            });

                            // Handle error responses.
                            if (res.status === 422) {
                                const body = await res.json();
                                for (const key of Object.keys(body.validation)) {
                                    registerValidation[key] = body.validation[key];
                                }
                            } else if (res.status !== 204) {
                                registerValidation["register-button"] = "There was an error while trying to register, please try again.";
                            }
                        } catch (err) {
                            registerValidation["register-button"] = "There was an error while trying to register, please try again.";
                        }

                        // If there are any validation errors, update the validation element and hide the loading image.
                        if (Object.keys(registerValidation).length > 0) {
                            await Index.updateValidation("register-errors", registerValidation);

                            loginLoading.classList.add("hidden");
                            loginModal.classList.remove("hidden");
                            return;
                        }

                        // Close the modal.
                        Index.modal.close();

                        // Open a confirmation modal.
                        await Index.showModal("Email Validation Required", "You must validate your email address to complete your registration.  Please check your email and follow the link to validate your email address.  Be sure to check your spam folder for the validation email.");
                    }
                });

                document.getElementById("recover-button").addEventListener("click", async () => {
                    const recoverEmail = /** @type {HTMLInputElement} */(document.getElementById("recover-email")), // eslint-disable-line no-extra-parens
                        loginModal = /** @type {HTMLDivElement} */(document.getElementById("login-modal")), // eslint-disable-line no-extra-parens
                        loginLoading = /** @type {HTMLDivElement} */(document.getElementById("login-loading")); // eslint-disable-line no-extra-parens

                    // Email validation.
                    if (recoverEmail.value.length === 0) {
                        recoverValidation["recover-email"] = "You must enter your email address.";
                    } else if (recoverEmail.value.length > 256) {
                        recoverValidation["recover-email"] = "Your email address must be at most 256 characters.";
                    } else if (!Index.emailRegex.test(recoverEmail.value)) { // eslint-disable-line no-negated-condition
                        recoverValidation["recover-email"] = "You must enter a valid email address.";
                    } else {
                        delete recoverValidation["recover-email"];
                        document.getElementById("recover-email").classList.remove("error");
                    }

                    // Clear recover validation.
                    delete recoverValidation["recover-button"];

                    // Update validation element.
                    await Index.updateValidation("recover-errors", recoverValidation);

                    // If there are no validation errors, attempt to proceed.
                    if (Object.keys(recoverValidation).length === 0) {
                        // Show loading image.
                        loginModal.classList.add("hidden");
                        loginLoading.classList.remove("hidden");

                        let status;

                        try {
                            // Recover password on the server.
                            const res = await fetch("/api/recover", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({email: recoverEmail.value})
                            });

                            // Handle error responses.
                            if (res.status === 422) {
                                const body = await res.json();
                                for (const key of Object.keys(body.validation)) {
                                    recoverValidation[key] = body.validation[key];
                                }
                            } else if (res.status !== 204 && res.status !== 403) {
                                recoverValidation["recover-button"] = "There was an error while trying to recover your password, please try again.";
                            }

                            status = res.status;
                        } catch (err) {
                            recoverValidation["recover-button"] = "There was an error while trying to recover your password, please try again.";
                        }

                        // If there are any validation errors, update the validation element and hide the loading image.
                        if (Object.keys(recoverValidation).length > 0) {
                            await Index.updateValidation("recover-errors", recoverValidation);

                            loginLoading.classList.add("hidden");
                            loginModal.classList.remove("hidden");
                            return;
                        }

                        // Close the modal.
                        Index.modal.close();

                        // Open a confirmation modal.
                        if (status === 403) {
                            await Index.showModal("Email Validation Required", "You must validate your email address to complete your registration.  Please check your email and follow the link to validate your email address.  Be sure to check your spam folder for the validation email.");
                        } else {
                            await Index.showModal("Password Recovery Request", "Your password recovery request has been accepted.  An email with instructions on how to change your password has been sent to your account.  You will have two hours to change your password before the request expires.");
                        }
                    }
                });

                return;
            }

            if (el.id === "log-out") {
                try {
                    await fetch("/api/logout", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                } catch (err) { /* If there's an error, we'll just assume they're logged out and reload the page. */ }

                if (window.location.href.indexOf("?") !== -1) {
                    window.location.href = window.location.href.substr(0, window.location.href.indexOf("?"));
                    return;
                }

                window.location.reload();
                return;
            }

            // Setup media links.
            if (el.classList.contains("add-to-media-player")) {
                Index.addToPlaylist(el.dataset.source, el.dataset.url);
            }

            // Setup playlist buttons.
            if (el.classList.contains("media-player-item-play")) {
                const closest = el.closest("div.media-player-item");

                if (Index.mediaPlayer.playing && closest.classList.contains("active")) {
                    return;
                }

                Index.play(Array.prototype.indexOf.call(closest.parentNode.children, closest));
            }

            // Setup playlist removal buttons.
            if (el.classList.contains("media-player-item-remove")) {
                const item = el.closest("div.media-player-item");

                /** @type {number} */
                const index = Array.prototype.indexOf.call(item.parentNode.children, item);

                if (Index.mediaPlayer.currentIndex) {
                    if (Index.mediaPlayer.currentIndex === index) {
                        contentPlayer.innerHTML = "";
                        Index.mediaPlayer.currentIndex = void 0;
                        Index.mediaPlayer.currentSource = void 0;
                        Index.mediaPlayer.playing = false;
                    } else if (Index.mediaPlayer.currentIndex > index) {
                        Index.mediaPlayer.currentIndex--;
                    }
                }

                Index.mediaPlayer.playlist.splice(index, 1);

                item.parentNode.removeChild(document.querySelectorAll("div.media-player-item")[index]);
            }
        });

        document.getElementById("media-player-back").addEventListener("click", () => {
            if (Index.mediaPlayer.currentIndex === void 0) {
                return;
            }

            if (Index.mediaPlayer.currentIndex > 0) {
                switch (Index.mediaPlayer.currentSource) {
                    case "soundcloud":
                        Index.widget.pause();
                        break;
                    case "youtube":
                        Index.widget.pauseVideo();
                        break;
                }
                Index.play(Index.mediaPlayer.currentIndex - 1);
            } else {
                Index.mediaPlayer.currentSource = void 0;
            }
        });

        document.getElementById("media-player-pause").addEventListener("click", () => {
            if (Index.mediaPlayer.currentIndex === void 0) {
                return;
            }

            switch (Index.mediaPlayer.currentSource) {
                case "soundcloud":
                    Index.widget.pause();
                    break;
                case "youtube":
                    Index.widget.stopVideo();
                    break;
            }
        });

        document.getElementById("media-player-play").addEventListener("click", () => {
            if (!Index.mediaPlayer.playing) {
                switch (Index.mediaPlayer.currentSource) {
                    case "soundcloud":
                        Index.widget.play();
                        break;
                    case "youtube":
                        Index.widget.playVideo();
                        break;
                }
            }
        });

        document.getElementById("media-player-forward").addEventListener("click", () => {
            if (Index.mediaPlayer.currentIndex === void 0) {
                return;
            }

            if (Index.mediaPlayer.currentIndex < Index.mediaPlayer.playlist.length - 1) {
                switch (Index.mediaPlayer.currentSource) {
                    case "soundcloud":
                        Index.widget.pause();
                        break;
                    case "youtube":
                        Index.widget.pauseVideo();
                        break;
                }
                Index.play(Index.mediaPlayer.currentIndex + 1);
            } else {
                Index.mediaPlayer.currentSource = void 0;
            }
        });

        if (Index.validated || Index.emailChangeAuthorized || Index.emailChanged || Index.changePasswordSuccess) {
            document.getElementById("log-in").click();
        }

        if (Index.changeEmailSuccess) {
            await Index.showModal("Email Validation Required", "You must validate your new email address to complete your request.  Please check your email and follow the link to validate your new email address.  Be sure to check your spam folder for the validation email.");
        }
    }
}

Index.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
Index.soundcloudRegex = /^https?:\/\/api\.soundcloud.com\/tracks\/(?<trackId>[0-9]+)(?:\/stream)?/;
Index.youtubeRegex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=(?<videoId>[^&]*)(?:&.*)?$/;

Index.changeEmailSuccess = false;

Index.changePasswordSuccess = false;

Index.emailChangeAuthorized = false;

Index.emailChanged = false;

/** @type {{playlist: any[], adding: boolean, toAdd: any[], playing: boolean, currentIndex: number, currentSource: string}} */
Index.mediaPlayer = {
    playlist: [],
    adding: false,
    toAdd: [],
    playing: false,
    currentIndex: void 0,
    currentSource: void 0
};

/** @type {typeof import("../js/common/modal")} */
// @ts-ignore
Index.Modal = typeof Modal === "undefined" ? require("../js/common/modal") : Modal; // eslint-disable-line no-undef

/** @type {import("../js/common/modal")} */
Index.modal = null;

/** @type {typeof import("../js/common/template")} */
// @ts-ignore
Index.Template = typeof Template === "undefined" ? require("../js/common/template") : Template; // eslint-disable-line no-undef

/** @type {User} */
Index.user = null;

Index.validated = false;

Index.widget = null;

document.addEventListener("DOMContentLoaded", Index.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Index = Index;
} else {
    module.exports = Index; // eslint-disable-line no-undef
}
