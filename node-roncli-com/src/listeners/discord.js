/**
 * @typedef {import("discord.js").Message} DiscordJs.Message
 * @typedef {import("discord.js").Presence} DiscordJs.Presence
 * @typedef {import("discord.js").VoiceChannel} DiscordJs.VoiceChannel
 * @typedef {import("discord.js").VoiceState} DiscordJs.VoiceState
 */

const Commands = require("../discord/commands"),
    Discord = require("../discord"),
    Log = require("@roncli/node-application-insights-logger"),
    Twitch = require("../twitch"),
    Warning = require("../errors/warning"),

    messageParse = /^!(?<cmd>[^ ]+)(?: +(?<args>.*[^ ]))? *$/,
    urlParse = /^https:\/\/www.twitch.tv\/(?<user>.+)$/;

/** @type {Commands} */
let commands;

let lastAnnounced = 0;

//  ####     #                                    #  #        #            #
//   #  #                                         #  #                     #
//   #  #   ##     ###    ###    ###   # ##    ## #  #       ##     ###   ####    ###   # ##    ###   # ##
//   #  #    #    #      #   #  #   #  ##  #  #  ##  #        #    #       #     #   #  ##  #  #   #  ##  #
//   #  #    #     ###   #      #   #  #      #   #  #        #     ###    #     #####  #   #  #####  #
//   #  #    #        #  #   #  #   #  #      #  ##  #        #        #   #  #  #      #   #  #      #
//  ####    ###   ####    ###    ###   #       ## #  #####   ###   ####     ##    ###   #   #   ###   #
/**
 * A class that handles listening to Discord events.
 */
class DiscordListener {
    // # #    ##    ###    ###    ###   ###   ##
    // ####  # ##  ##     ##     #  #  #  #  # ##
    // #  #  ##      ##     ##   # ##   ##   ##
    // #  #   ##   ###    ###     # #  #      ##
    //                                  ###
    /**
     * Handles when a message is posted in Discord.
     * @param {DiscordJs.Message} message The message.
     * @returns {Promise} A promise that resolves when the event has been processed.
     */
    static async message(message) {
        const member = Discord.findGuildMemberById(message.author.id);

        for (const text of message.content.split("\n")) {
            if (!messageParse.test(text)) {
                continue;
            }

            const {groups: {cmd, args}} = messageParse.exec(text),
                command = cmd.toLocaleLowerCase();

            if (Object.getOwnPropertyNames(Commands.prototype).filter((p) => typeof Commands.prototype[p] === "function" && p !== "constructor").indexOf(command) !== -1) {
                let success;
                try {
                    success = await commands[command](member, message.channel, args);
                } catch (err) {
                    if (err instanceof Warning) {
                        Log.warn(`${message.channel} ${member}: ${text} - ${err.message || err}`);
                    } else {
                        Log.error(`${message.channel} ${member}: ${text}`, {err});
                    }

                    return;
                }

                if (success) {
                    Log.verbose(`${message.channel} ${member}: ${text}`);
                }
            }
        }
    }

    //                                                  #  #           #         #
    //                                                  #  #           #         #
    // ###   ###    ##    ###    ##   ###    ##    ##   #  #  ###    ###   ###  ###    ##
    // #  #  #  #  # ##  ##     # ##  #  #  #     # ##  #  #  #  #  #  #  #  #   #    # ##
    // #  #  #     ##      ##   ##    #  #  #     ##    #  #  #  #  #  #  # ##   #    ##
    // ###   #      ##   ###     ##   #  #   ##    ##    ##   ###    ###   # #    ##   ##
    // #                                                      #
    /**
     * Handles when a user's presence is updated in Discord.
     * @param {DiscordJs.Presence} oldPresence The old presence.
     * @param {DiscordJs.Presence} newPresence The new presence.
     * @returns {Promise} A promise that resolves when the event has been processed.
     */
    static async presenceUpdate(oldPresence, newPresence) {
        if (newPresence && newPresence.activities && newPresence.member && newPresence.guild && newPresence.guild.id === Discord.id && Discord.isOwner(newPresence.member)) {
            const oldActivity = oldPresence && oldPresence.activities && oldPresence.activities.find((p) => p.name === "Twitch") || void 0,
                activity = newPresence.activities.find((p) => p.name === "Twitch");

            if (activity && urlParse.test(activity.url)) {
                if (!oldActivity) {
                    if (Date.now() - lastAnnounced < 300000) {
                        lastAnnounced = Date.now();
                        return;
                    }

                    lastAnnounced = new Date().getTime();

                    const user = await Twitch.twitchClient.users.getUserByName("roncli"),
                        channel = await Twitch.twitchClient.channels.getChannelInfoById(user.id);

                    await Discord.richQueue(Discord.embedBuilder({
                        timestamp: Date.now(), // TODO: Use new Date() again once this is fixed: https://github.com/discordjs/discord.js/issues/8323
                        thumbnail: {
                            url: user.profilePictureUrl,
                            width: 300,
                            height: 300
                        },
                        url: `https://twitch.tv/${user.name}`,
                        description: `Boom, bitches.  roncli is live on Twitch!  Watch at https://twitch.tv/${user.name}`,
                        fields: [
                            {
                                name: "Stream Title",
                                value: channel.title
                            },
                            {
                                name: "Now Playing",
                                value: activity.state
                            }
                        ]
                    }), Discord.findTextChannelByName("stream-notifications"));
                }
            }
        }
    }

    //                      #
    //                      #
    // ###    ##    ###   ###  #  #
    // #  #  # ##  #  #  #  #  #  #
    // #     ##    # ##  #  #   # #
    // #      ##    # #   ###    #
    //                          #
    /**
     * Handles when Discord is ready.
     * @returns {void}
     */
    static ready() {
        commands = new Commands(Discord);
    }
}

module.exports = DiscordListener;
