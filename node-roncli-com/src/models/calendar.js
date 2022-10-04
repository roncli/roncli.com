const Discord = require("../discord"),
    DiscordJs = require("discord.js"),
    Encoding = require("../../public/js/common/encoding"),
    Log = require("@roncli/node-application-insights-logger"),
    GoogleCalendar = require("../google/calendar");

//   ###           ##                      #
//  #   #           #                      #
//  #       ###     #     ###   # ##    ## #   ###   # ##
//  #          #    #    #   #  ##  #  #  ##      #  ##  #
//  #       ####    #    #####  #   #  #   #   ####  #
//  #   #  #   #    #    #      #   #  #  ##  #   #  #
//   ###    ####   ###    ###   #   #   ## #   ####  #
/**
 * A class that represents a calendar event.
 */
class Calendar {
    //       #                 #     ####                     #
    //       #                 #     #                        #
    //  ##   ###    ##    ##   # #   ###   # #    ##   ###   ###    ###
    // #     #  #  # ##  #     ##    #     # #   # ##  #  #   #    ##
    // #     #  #  ##    #     # #   #     # #   ##    #  #   #      ##
    //  ##   #  #   ##    ##   #  #  ####   #     ##   #  #    ##  ###
    /**
     * Checks the Google Calendar events and posts Discord events accordingly.
     */
    static async checkEvents() {
        try {
            const googleEvents = await GoogleCalendar.getEvents(),
                discordEvents = await Discord.getEvents();

            // Remove Discord events that don't exist in Google events.
            for (const event of discordEvents) {
                if (!event.scheduledStartAt) {
                    await event.delete();
                } else if (event.scheduledStartAt.getTime() > Date.now() && !googleEvents.find((e) => {
                    // Event name must match.
                    if (e.summary !== event.name) {
                        return false;
                    }

                    // There must be a start time.
                    if (!e.start || !e.start.dateTime) {
                        return false;
                    }

                    // The start times must match.
                    if (new Date(e.start.dateTime).getTime() !== event.scheduledStartAt.getTime()) {
                        return false;
                    }

                    if (e.end && e.end.dateTime) {
                        // If there is an end time on one service, there must be an end time on another service and they must match.
                        if (!event.scheduledEndAt) {
                            return false;
                        }

                        if (new Date(e.end.dateTime).getTime() !== event.scheduledEndAt.getTime()) {
                            return false;
                        }
                    } else if (event.scheduledEndAt) {
                        // If there isn't an end time on one server, there cannot be an end time on another.
                        return false;
                    }

                    return true;
                })) {
                    await event.delete();
                }
            }

            // Add Google events that don't exist in Discord events.
            for (const event of googleEvents) {
                if (!event.start || !event.start.dateTime) {
                    continue;
                }

                if (!discordEvents.find((e) => {
                    // Event name must match.
                    if (e.name !== event.summary) {
                        return false;
                    }

                    // There must be a start time.
                    if (!e.scheduledStartAt) {
                        return false;
                    }

                    // The start times must match.
                    if (e.scheduledStartAt.getTime() !== new Date(event.start.dateTime).getTime()) {
                        return false;
                    }

                    if (e.scheduledEndAt) {
                        // If there is an end time on one service, there must be an end time on another service and they must match.
                        if (!event.end || !event.end.dateTime) {
                            return false;
                        }

                        if (e.scheduledEndAt.getTime() !== new Date(event.end.dateTime).getTime()) {
                            return false;
                        }
                    } else if (event.end && event.end.dateTime) {
                        // If there isn't an end time on one server, there cannot be an end time on another.
                        return false;
                    }

                    return true;
                })) {
                    await Discord.createEvent({
                        name: event.summary,
                        scheduledStartTime: new Date(event.start.dateTime),
                        scheduledEndTime: new Date(event.end.dateTime),
                        privacyLevel: DiscordJs.GuildScheduledEventPrivacyLevel.GuildOnly,
                        entityType: DiscordJs.GuildScheduledEventEntityType.External,
                        description: Encoding.htmlDecode(event.description),
                        entityMetadata: {location: event.location},
                        reason: "New event."
                    });
                }
            }
        } catch (err) {
            Log.error("There was an error while checking Google and Discord events.", {err});
        }

        setTimeout(Calendar.checkEvents, 3600000);
    }
}

module.exports = Calendar;
