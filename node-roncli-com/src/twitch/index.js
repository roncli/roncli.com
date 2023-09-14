const Log = require("@roncli/node-application-insights-logger"),
    TwitchAuth = require("@twurple/auth"),
    TwitchClient = require("@twurple/api").ApiClient;

/** @type {TwitchAuth.AuthProvider} */
let authProvider;

/** @type {TwitchClient} */
let twitchClient;

//  #####           #     #            #
//    #                   #            #
//    #    #   #   ##    ####    ###   # ##
//    #    #   #    #     #     #   #  ##  #
//    #    # # #    #     #     #      #   #
//    #    # # #    #     #  #  #   #  #   #
//    #     # #    ###     ##    ###   #   #
/**
 * Handles Twitch integration.
 */
class Twitch {
    //  #           #     #          #      ##   ##     #                 #
    //  #                 #          #     #  #   #                       #
    // ###   #  #  ##    ###    ##   ###   #      #    ##     ##   ###   ###
    //  #    #  #   #     #    #     #  #  #      #     #    # ##  #  #   #
    //  #    ####   #     #    #     #  #  #  #   #     #    ##    #  #   #
    //   ##  ####  ###     ##   ##   #  #   ##   ###   ###    ##   #  #    ##
    /**
     * Gets the current Twitch client.
     * @returns {TwitchClient} The current Twitch client.
     */
    static get twitchClient() {
        return twitchClient;
    }

    //                                      #
    //                                      #
    //  ##    ##   ###   ###    ##    ##   ###
    // #     #  #  #  #  #  #  # ##  #      #
    // #     #  #  #  #  #  #  ##    #      #
    //  ##    ##   #  #  #  #   ##    ##     ##
    /**
     * Connects to Twitch.
     * @returns {boolean} Whether the Twitch client is ready.
     */
    static connect() {
        if (!authProvider) {
            Log.verbose("Logging into Twitch...");
            try {
                Twitch.login();
            } catch (err) {
                Log.error("Error connecting to Twitch.", {err});
            }

            Log.verbose("Connected to Twitch.");
        }

        return !!authProvider;
    }

    // ##                 #
    //  #
    //  #     ##    ###  ##    ###
    //  #    #  #  #  #   #    #  #
    //  #    #  #   ##    #    #  #
    // ###    ##   #     ###   #  #
    //              ###
    /**
     * Logs in to Twitch and creates the Twitch client.
     * @returns {void}
     */
    static login() {
        authProvider = new TwitchAuth.AppTokenAuthProvider(process.env.TWITCH_CLIENTID, process.env.TWITCH_CLIENTSECRET);

        twitchClient = new TwitchClient({
            authProvider,
            logger: {colors: false}
        });
    }
}

module.exports = Twitch;
