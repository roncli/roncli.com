/**
 * @typedef {import("discord.js").Message} DiscordJs.Message
 * @typedef {import("discord.js").Presence} DiscordJs.Presence
 * @typedef {import("discord.js").VoiceChannel} DiscordJs.VoiceChannel
 * @typedef {import("discord.js").VoiceState} DiscordJs.VoiceState
 */

const Commands = require("../discord/commands"),
    Discord = require("../discord"),
    Log = require("@roncli/node-application-insights-logger"),
    Warning = require("../errors/warning"),

    messageParse = /^!(?<cmd>[^ ]+)(?: +(?<args>.*[^ ]))? *$/;

/** @type {Commands} */
let commands;

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
