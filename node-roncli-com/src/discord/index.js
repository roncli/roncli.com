const DiscordJs = require("discord.js"),
    events = require("events"),
    Log = require("@roncli/node-application-insights-logger"),
    util = require("util"),

    discord = new DiscordJs.Client({
        intents: [
            DiscordJs.GatewayIntentBits.Guilds,
            DiscordJs.GatewayIntentBits.GuildMessages,
            DiscordJs.GatewayIntentBits.GuildPresences,
            DiscordJs.GatewayIntentBits.MessageContent
        ],
        rest: {retries: 999999999}
    });

let readied = false;

/** @type {DiscordJs.Guild} */
let guild;

const eventEmitter = new events.EventEmitter();

/** @type {DiscordJs.Role} */
let roncliRole;

//  ####     #                                    #
//   #  #                                         #
//   #  #   ##     ###    ###    ###   # ##    ## #
//   #  #    #    #      #   #  #   #  ##  #  #  ##
//   #  #    #     ###   #      #   #  #      #   #
//   #  #    #        #  #   #  #   #  #      #  ##
//  ####    ###   ####    ###    ###   #       ## #
/**
 * A static class that handles all Discord.js interctions.
 */
class Discord {
    //                          #
    //                          #
    //  ##   # #    ##   ###   ###    ###
    // # ##  # #   # ##  #  #   #    ##
    // ##    # #   ##    #  #   #      ##
    //  ##    #     ##   #  #    ##  ###
    /**
     * Returns the EventEmitter for Discord events.
     * @returns {events.EventEmitter} The EventEmitter object.
     */
    static get events() {
        return eventEmitter;
    }

    //  #
    //
    // ##     ##    ##   ###
    //  #    #     #  #  #  #
    //  #    #     #  #  #  #
    // ###    ##    ##   #  #
    /**
     * Returns the guild's icon.
     * @returns {string} The URL of the icon.
     */
    static get icon() {
        if (discord && discord.ws && discord.ws.status === 0) {
            return discord.user.avatarURL();
        }

        return void 0;
    }

    //  #       #
    //          #
    // ##     ###
    //  #    #  #
    //  #    #  #
    // ###    ###
    /**
     * Returns the server ID.
     * @returns {string} The ID of the server.
     */
    static get id() {
        if (guild) {
            return guild.id;
        }

        return void 0;
    }

    //         #                 #
    //         #                 #
    //  ###   ###    ###  ###   ###   #  #  ###
    // ##      #    #  #  #  #   #    #  #  #  #
    //   ##    #    # ##  #      #    #  #  #  #
    // ###      ##   # #  #       ##   ###  ###
    //                                      #
    /**
     * Sets up Discord events.  Should only ever be called once.
     * @returns {void}
     */
    static startup() {
        discord.on("ready", () => {
            Log.verbose("Connected to Discord.");

            guild = discord.guilds.cache.find((g) => g.name === process.env.DISCORD_GUILD);

            roncliRole = guild.roles.cache.find((r) => r.name === "roncli");

            eventEmitter.emit("ready");

            if (!readied) {
                readied = true;
            }
        });

        discord.on("disconnect", (ev) => {
            Log.error("Disconnected from Discord.", {err: ev instanceof Error ? ev : new Error(util.inspect(ev))});
        });

        if (+process.env.DISCORD_ENABLED) {
            discord.on("messageCreate", (message) => {
                eventEmitter.emit("message", message);
            });

            discord.on("presenceUpdate", (oldPresence, newPresence) => {
                eventEmitter.emit("presenceUpdate", oldPresence, newPresence);
            });

            discord.on("voiceStateUpdate", (oldState, newState) => {
                eventEmitter.emit("voiceStateUpdate", oldState, newState);
            });
        }

        discord.on("error", (err) => {
            if (err.message === "read ECONNRESET") {
                // Swallow this error, see https://github.com/discordjs/discord.js/issues/3043#issuecomment-465543902
                return;
            }

            Log.error("Discord error.", {err});
        });
    }

    //                                      #
    //                                      #
    //  ##    ##   ###   ###    ##    ##   ###
    // #     #  #  #  #  #  #  # ##  #      #
    // #     #  #  #  #  #  #  ##    #      #
    //  ##    ##   #  #  #  #   ##    ##     ##
    /**
     * Connects to Discord.
     * @returns {Promise} A promise that resolves once Discord is connected.
     */
    static async connect() {
        Log.verbose("Connecting to Discord...");

        try {
            await discord.login();
        } catch (err) {
            Log.error("Error connecting to Discord, will automatically retry.", {err});
        }
    }

    //  #            ##                                  #             #
    //              #  #                                 #             #
    // ##     ###   #      ##   ###   ###    ##    ##   ###    ##    ###
    //  #    ##     #     #  #  #  #  #  #  # ##  #      #    # ##  #  #
    //  #      ##   #  #  #  #  #  #  #  #  ##    #      #    ##    #  #
    // ###   ###     ##    ##   #  #  #  #   ##    ##     ##   ##    ###
    /**
     * Determines whether the bot is connected to Discord.
     * @returns {boolean} Whether the bot is connected to Discord.
     */
    static isConnected() {
        return discord && discord.ws && guild ? discord.ws.status === 0 : false;
    }

    //  ###  #  #   ##   #  #   ##
    // #  #  #  #  # ##  #  #  # ##
    // #  #  #  #  ##    #  #  ##
    //  ###   ###   ##    ###   ##
    //    #
    /**
     * Queues a message to be sent.
     * @param {string} message The message to be sent.
     * @param {DiscordJs.TextChannel|DiscordJs.DMChannel|DiscordJs.GuildMember} channel The channel to send the message to.
     * @returns {Promise<DiscordJs.Message>} A promise that returns the sent message.
     */
    static async queue(message, channel) {
        if (channel.id === discord.user.id) {
            return void 0;
        }

        let msg;
        try {
            msg = await Discord.richQueue(Discord.embedBuilder({description: message}), channel);
        } catch {}
        return msg;
    }

    //             #              #  ###          #    ##       #
    //             #              #  #  #               #       #
    //  ##   # #   ###    ##    ###  ###   #  #  ##     #     ###   ##   ###
    // # ##  ####  #  #  # ##  #  #  #  #  #  #   #     #    #  #  # ##  #  #
    // ##    #  #  #  #  ##    #  #  #  #  #  #   #     #    #  #  ##    #
    //  ##   #  #  ###    ##    ###  ###    ###  ###   ###    ###   ##   #
    /**
     * Gets a new DiscordJs EmbedBuilder object.
     * @param {DiscordJs.EmbedData} [options] The options to pass.
     * @returns {DiscordJs.EmbedBuilder} The EmbedBuilder object.
     */
    static embedBuilder(options) {
        return new DiscordJs.EmbedBuilder(options);
    }

    //        #          #      ##
    //                   #     #  #
    // ###   ##     ##   ###   #  #  #  #   ##   #  #   ##
    // #  #   #    #     #  #  #  #  #  #  # ##  #  #  # ##
    // #      #    #     #  #  ## #  #  #  ##    #  #  ##
    // #     ###    ##   #  #   ##    ###   ##    ###   ##
    //                            #
    /**
     * Queues a rich embed message to be sent.
     * @param {DiscordJs.EmbedBuilder} embed The message to be sent.
     * @param {DiscordJs.TextChannel|DiscordJs.DMChannel|DiscordJs.GuildMember} channel The channel to send the message to.
     * @returns {Promise<DiscordJs.Message>} A promise that returns the sent message.
     */
    static async richQueue(embed, channel) {
        if (channel.id === discord.user.id) {
            return void 0;
        }

        embed.setFooter({
            text: embed.data && embed.data.footer ? embed.data.footer.text : "BotCli",
            iconURL: embed.data && embed.data.footer && embed.data.footer.icon_url || Discord.icon
        });

        if (embed && embed.data && embed.data.fields) {
            embed.data.fields.forEach((field) => {
                if (field.value && field.value.length > 1024) {
                    field.value = field.value.substring(0, 1024);
                }
            });
        }

        if (!embed.data || !embed.data.color) {
            embed.setColor(0x16f6f8);
        }

        if (!embed.data || !embed.data.timestamp) {
            embed.setTimestamp(new Date());
        }

        let msg;
        try {
            const msgSend = await channel.send({embeds: [embed]});

            if (msgSend instanceof Array) {
                msg = msgSend[0];
            } else {
                msg = msgSend;
            }
        } catch {}
        return msg;
    }

    //                          #          ####                     #
    //                          #          #                        #
    //  ##   ###    ##    ###  ###    ##   ###   # #    ##   ###   ###
    // #     #  #  # ##  #  #   #    # ##  #     # #   # ##  #  #   #
    // #     #     ##    # ##   #    ##    #     # #   ##    #  #   #
    //  ##   #      ##    # #    ##   ##   ####   #     ##   #  #    ##
    /**
     * Creates a new event on the Discord server.
     * @param {DiscordJs.GuildScheduledEventCreateOptions} data The event data.
     * @returns {Promise<DiscordJs.GuildScheduledEvent>} A promise that returns the event.
     */
    static createEvent(data) {
        if (!guild) {
            return void 0;
        }
        return guild.scheduledEvents.create(data);
    }

    //   #    #             #   ##          #    ##       #  #  #              #                 ###         ###      #
    //  # #                 #  #  #               #       #  ####              #                 #  #         #       #
    //  #    ##    ###    ###  #     #  #  ##     #     ###  ####   ##   # #   ###    ##   ###   ###   #  #   #     ###
    // ###    #    #  #  #  #  # ##  #  #   #     #    #  #  #  #  # ##  ####  #  #  # ##  #  #  #  #  #  #   #    #  #
    //  #     #    #  #  #  #  #  #  #  #   #     #    #  #  #  #  ##    #  #  #  #  ##    #     #  #   # #   #    #  #
    //  #    ###   #  #   ###   ###   ###  ###   ###    ###  #  #   ##   #  #  ###    ##   #     ###     #   ###    ###
    //                                                                                                  #
    /**
     * Returns the Discord user in the guild by their Discord ID.
     * @param {string} id The ID of the Discord user.
     * @returns {DiscordJs.GuildMember} The guild member.
     */
    static findGuildMemberById(id) {
        if (!guild) {
            return void 0;
        }
        return guild.members.cache.find((m) => m.id === id);
    }

    //   #    #             #  ###                #     ##   #                             ##    ###         #  #
    //  # #                 #   #                 #    #  #  #                              #    #  #        ## #
    //  #    ##    ###    ###   #     ##   #  #  ###   #     ###    ###  ###   ###    ##    #    ###   #  #  ## #   ###  # #    ##
    // ###    #    #  #  #  #   #    # ##   ##    #    #     #  #  #  #  #  #  #  #  # ##   #    #  #  #  #  # ##  #  #  ####  # ##
    //  #     #    #  #  #  #   #    ##     ##    #    #  #  #  #  # ##  #  #  #  #  ##     #    #  #   # #  # ##  # ##  #  #  ##
    //  #    ###   #  #   ###   #     ##   #  #    ##   ##   #  #   # #  #  #  #  #   ##   ###   ###     #   #  #   # #  #  #   ##
    //                                                                                                  #
    /**
     * Finds a Discord text channel by its name.
     * @param {string} name The name of the channel.
     * @returns {DiscordJs.TextChannel} The Discord text channel.
     */
    static findTextChannelByName(name) {
        if (!guild) {
            return void 0;
        }
        return /** @type {DiscordJs.TextChannel} */(guild.channels.cache.find((c) => c.name === name && c.type === DiscordJs.ChannelType.GuildText)); // eslint-disable-line no-extra-parens
    }

    //              #    ####                     #
    //              #    #                        #
    //  ###   ##   ###   ###   # #    ##   ###   ###    ###
    // #  #  # ##   #    #     # #   # ##  #  #   #    ##
    //  ##   ##     #    #     # #   ##    #  #   #      ##
    // #      ##     ##  ####   #     ##   #  #    ##  ###
    //  ###
    /**
     * Gets all Discord events.
     * @returns {Promise<DiscordJs.GuildScheduledEvent[]>} A promise that returns the Discord events.
     */
    static async getEvents() {
        if (!guild) {
            return [];
        }
        return Array.from((await guild.scheduledEvents.fetch()).values());
    }

    //  #            ##
    //              #  #
    // ##     ###   #  #  #  #  ###    ##   ###
    //  #    ##     #  #  #  #  #  #  # ##  #  #
    //  #      ##   #  #  ####  #  #  ##    #
    // ###   ###     ##   ####  #  #   ##   #
    /**
     * Determines whether the user is the owner.
     * @param {DiscordJs.GuildMember} member The user to check.
     * @returns {boolean} Whether the user is the owner.
     */
    static isOwner(member) {
        return !!(member && roncliRole.members.find((m) => m.id === member.id));
    }
}

module.exports = Discord;
