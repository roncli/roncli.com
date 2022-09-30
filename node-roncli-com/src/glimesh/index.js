const Discord = require("../discord"),
    Log = require("@roncli/node-application-insights-logger"),
    ws = require("ws");

/** @type {ws.WebSocket} */
let client;

/** @type {NodeJS.Timeout} */
let heartbeatTimeout;

/** @type {string} */
let subscriptionId;

//   ###    ##      #                         #
//  #   #    #                                #
//  #        #     ##    ## #    ###    ###   # ##
//  #        #      #    # # #  #   #  #      ##  #
//  #  ##    #      #    # # #  #####   ###   #   #
//  #   #    #      #    # # #  #          #  #   #
//   ###    ###    ###   #   #   ###   ####   #   #
/**
 * A class that handles calls to the Glimesh websocket.
 */
class Glimesh {
    //                                      #
    //                                      #
    //  ##    ##   ###   ###    ##    ##   ###
    // #     #  #  #  #  #  #  # ##  #      #
    // #     #  #  #  #  #  #  ##    #      #
    //  ##    ##   #  #  #  #   ##    ##     ##
    /**
     * Connects to the websocket.
     * @returns {void}
     */
    static connect() {
        client = new ws.WebSocket(`wss://glimesh.tv/api/graph/websocket?vsn=2.0.0&client_id=${process.env.GLIMESH_CLIENT_ID}`);

        client.on("open", () => {
            // Start the heartbeats.
            Glimesh.sendHeartbeat();

            // Join the absinthe control topic.
            client.send(JSON.stringify(["main", "join", "__absinthe__:control", "phx_join", {}]));
        });

        client.on("message", async (data) => {
            const [joinRef, ref, topic, event, payload] = JSON.parse(data.toString("utf8"));

            switch (topic) {
                case "phoenix":
                    if (ref === "heartbeat" && event === "phx_reply" && payload.status === "ok") {
                        Glimesh.sendHeartbeat();
                    }
                    break;
                case "__absinthe__:control":
                    if (joinRef === "main" && event === "phx_reply" && payload.status === "ok") {
                        await this.handleAPI(ref, payload);
                    }
                    break;
                case subscriptionId:
                    if (event === "subscription:data") {
                        this.handleSubscription(payload);
                    }
            }
        });

        client.on("close", (code, reason) => {
            Log.warn("The Glimesh websocket was closed.", {properties: {code, reason: reason ? reason.toString("utf8") : void 0}});

            if (client) {
                client.terminate();
                client = void 0;
            }
            setTimeout(Glimesh.connect, 30000);
        });

        client.on("error", (err) => {
            Log.error("There was an error with the Glimesh websocket.", {err});

            client.terminate();
            client = void 0;
            setTimeout(Glimesh.connect, 30000);
        });
    }

    // #                    #  ##           ##   ###   ###
    // #                    #   #          #  #  #  #   #
    // ###    ###  ###    ###   #     ##   #  #  #  #   #
    // #  #  #  #  #  #  #  #   #    # ##  ####  ###    #
    // #  #  # ##  #  #  #  #   #    ##    #  #  #      #
    // #  #   # #  #  #   ###  ###    ##   #  #  #     ###
    /**
     * Handles responses from the API.
     * @param {string} ref The reference of the caller.
     * @param {object} payload The API response payload.
     * @returns {Promise} A promise that resolves when the API response is handled.
     */
    static async handleAPI(ref, payload) {
        switch (ref) {
            case "join":
                // This is a confirmation that we have joined the absinthe control topic.  Subscribe to channel status changes.
                client.send(JSON.stringify(["main", "subscribe", "__absinthe__:control", "doc", {query: `subscription {channel(id: "${process.env.GLIMESH_CHANNEL_ID}") {status}}`}]));
                break;
            case "subscribe":
                // This is a confirmation that we have subscribed to channel status changes.  Store the subscription ID.
                subscriptionId = payload.response.subscriptionId;
                break;
            case "channel-api":
                // This is a reply from the channel API.  Make the go live announcement on Discord.
                await Discord.richQueue(Discord.embedBuilder({
                    timestamp: new Date(),
                    thumbnail: {
                        url: payload.response.data.channel.streamer.avatarUrl,
                        width: 300,
                        height: 300
                    },
                    url: `https://glimesh.tv/${payload.response.data.channel.streamer.displayname}`,
                    description: `Boom, bitches.  roncli is live on Glimesh!  Watch at https://glimesh.tv/${payload.response.data.channel.streamer.displayname}`,
                    fields: [
                        {
                            name: "Stream Title",
                            value: payload.response.data.channel.title
                        },
                        {
                            name: "Now Playing",
                            value: payload.response.data.channel.subcategory && payload.response.data.channel.subcategory.name || payload.response.data.channel.category && payload.response.data.channel.category.name || ""
                        }
                    ]
                }), Discord.findTextChannelByName("stream-notifications"));
                break;
        }
    }

    // #                    #  ##           ##         #                         #           #     #
    // #                    #   #          #  #        #                                     #
    // ###    ###  ###    ###   #     ##    #    #  #  ###    ###    ##   ###   ##    ###   ###   ##     ##   ###
    // #  #  #  #  #  #  #  #   #    # ##    #   #  #  #  #  ##     #     #  #   #    #  #   #     #    #  #  #  #
    // #  #  # ##  #  #  #  #   #    ##    #  #  #  #  #  #    ##   #     #      #    #  #   #     #    #  #  #  #
    // #  #   # #  #  #   ###  ###    ##    ##    ###  ###   ###     ##   #     ###   ###     ##  ###    ##   #  #
    //                                                                                #
    /**
     * Handles subscription updates.
     * @param {object} payload The subscription update payload.
     */
    static handleSubscription(payload) {
        if (payload.subscriptionId === subscriptionId && payload.result.data.channel.status === "LIVE") {
            // We are live, query the channel API so we can send our go live announcement.
            client.send(JSON.stringify(["main", "channel-api", "__absinthe__:control", "doc", {query: `query {channel(id: "${process.env.GLIMESH_CHANNEL_ID}") {category {name} subcategory {name} title updatedAt streamer {avatarUrl displayname}}}`}]));
        }
    }

    //                       #  #  #                     #    #                  #
    //                       #  #  #                     #    #                  #
    //  ###    ##   ###    ###  ####   ##    ###  ###   ###   ###    ##    ###  ###
    // ##     # ##  #  #  #  #  #  #  # ##  #  #  #  #   #    #  #  # ##  #  #   #
    //   ##   ##    #  #  #  #  #  #  ##    # ##  #      #    #  #  ##    # ##   #
    // ###     ##   #  #   ###  #  #   ##    # #  #       ##  ###    ##    # #    ##
    /**
     * Sends a heartbeat to the server.
     * @returns {void}
     */
    static sendHeartbeat() {
        if (client) {
            // Clear heartbeat timeout.
            if (heartbeatTimeout) {
                clearTimeout(heartbeatTimeout);
                heartbeatTimeout = void 0;
            }

            // Set new heartbeat timeout.
            heartbeatTimeout = setTimeout(() => {
                Log.warn("The Glimesh websocket failed to respond to a heartbeat.");

                client.terminate();
                client = void 0;
                setTimeout(Glimesh.connect, 30000);
            }, 35000);

            // Send heartbeat.
            client.send(JSON.stringify([null, "heartbeat", "phoenix", "heartbeat", {}]));
        }
    }
}

module.exports = Glimesh;
