/**
 * @typedef {typeof import("./index")} Discord
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 * @typedef {import("discord.js").TextChannel} DiscordJs.TextChannel
 * @typedef {import("discord.js").User} DiscordJs.User
 */

const pjson = require("../../package.json"),
    Warning = require("../errors/warning"),

    idMessageParse = /^<@!?(?<id>[0-9]+)> (?<command>[^ ]+)(?: (?<newMessage>.+))?$/;

/** @type {Discord} */
let Discord;

//   ###                                          #
//  #   #                                         #
//  #       ###   ## #   ## #    ###   # ##    ## #   ###
//  #      #   #  # # #  # # #      #  ##  #  #  ##  #
//  #      #   #  # # #  # # #   ####  #   #  #   #   ###
//  #   #  #   #  # # #  # # #  #   #  #   #  #  ##      #
//   ###    ###   #   #  #   #   ####  #   #   ## #  ####
/**
 * A class that handles commands given by chat.
 */
class Commands {
    //       #                 #      ##   #                             ##    ###           ##          ##
    //       #                 #     #  #  #                              #     #           #  #        #  #
    //  ##   ###    ##    ##   # #   #     ###    ###  ###   ###    ##    #     #     ###   #  #  ###    #     ##   ###   # #    ##   ###
    // #     #  #  # ##  #     ##    #     #  #  #  #  #  #  #  #  # ##   #     #    ##     #  #  #  #    #   # ##  #  #  # #   # ##  #  #
    // #     #  #  ##    #     # #   #  #  #  #  # ##  #  #  #  #  ##     #     #      ##   #  #  #  #  #  #  ##    #     # #   ##    #
    //  ##   #  #   ##    ##   #  #   ##   #  #   # #  #  #  #  #   ##   ###   ###   ###     ##   #  #   ##    ##   #      #     ##   #
    /**
     * Checks to ensure a channel is a challenge room.
     * @param {DiscordJs.TextChannel} channel The channel.
     * @returns {boolean} Whether the channel is on the correct server.
     */
    static checkChannelIsOnServer(channel) {
        return channel.type === "GUILD_TEXT" && channel.guild.name === process.env.DISCORD_GUILD;
    }

    //       #                 #     #  #              #                 ###           ##
    //       #                 #     ####              #                  #           #  #
    //  ##   ###    ##    ##   # #   ####   ##   # #   ###    ##   ###    #     ###   #  #  #  #  ###    ##   ###
    // #     #  #  # ##  #     ##    #  #  # ##  ####  #  #  # ##  #  #   #    ##     #  #  #  #  #  #  # ##  #  #
    // #     #  #  ##    #     # #   #  #  ##    #  #  #  #  ##    #      #      ##   #  #  ####  #  #  ##    #
    //  ##   #  #   ##    ##   #  #  #  #   ##   #  #  ###    ##   #     ###   ###     ##   ####  #  #   ##   #
    /**
     * Checks to ensure the member is the owner of the server.
     * @param {DiscordJs.GuildMember} member The member to check.
     * @returns {void}
     */
    static checkMemberIsOwner(member) {
        if (!Discord.isOwner(member)) {
            throw new Warning("Owner permission required to perform this command.");
        }
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates an instance of the command handler.
     * @param {Discord} discord The Discord object.
     */
    constructor(discord) {
        if (!Discord) {
            Discord = discord;
        }
    }

    //         #                ##           #
    //                           #           #
    //  ###   ##    # #   #  #   #     ###  ###    ##
    // ##      #    ####  #  #   #    #  #   #    # ##
    //   ##    #    #  #  #  #   #    # ##   #    ##
    // ###    ###   #  #   ###  ###    # #    ##   ##
    /**
     * Simulates other users making a command.
     * @param {DiscordJs.GuildMember} member The guild member initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async simulate(member, channel, message) {
        await Commands.checkMemberIsOwner(member);

        if (!idMessageParse.test(message)) {
            return false;
        }

        const {groups: {id, command, newMessage}} = idMessageParse.exec(message);
        if (Object.getOwnPropertyNames(Commands.prototype).filter((p) => typeof Commands.prototype[p] === "function" && p !== "constructor").indexOf(command) === -1) {
            throw new Warning("Invalid command.");
        }

        const newMember = await Discord.findGuildMemberById(id);
        if (!newMember) {
            throw new Warning("User does not exist on the server.");
        }

        return await this[command](newMember, channel, newMessage) || void 0;
    }

    //                           #
    //
    // # #    ##   ###    ###   ##     ##   ###
    // # #   # ##  #  #  ##      #    #  #  #  #
    // # #   ##    #       ##    #    #  #  #  #
    //  #     ##   #     ###    ###    ##   #  #
    /**
     * Replies with the current version of the bot.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async version(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (message) {
            return false;
        }

        await Discord.queue(`roncli Gaming.  Boom, bitches.  By roncli, Version ${pjson.version}.  Project is open source, visit https://github.com/roncli/roncli.com.`, channel);
        return true;
    }
}

module.exports = Commands;
