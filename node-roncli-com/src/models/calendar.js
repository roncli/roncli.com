const Discord = require("../discord"),
    DiscordJs = require("discord.js"),
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
                if (event.scheduledStartAt.getTime() > Date.now() && !googleEvents.find((e) => new Date(e.start.dateTime).getTime() === event.scheduledStartAt.getTime() && new Date(e.end.dateTime).getTime() === event.scheduledEndAt.getTime() && e.summary === event.name)) {
                    await event.delete();
                }
            }

            // Add Google events that don't exist in Discord events.
            for (const event of googleEvents) {
                if (!discordEvents.find((e) => e.scheduledStartAt.getTime() === new Date(event.start.dateTime).getTime() && e.scheduledEndAt.getTime() === new Date(event.end.dateTime).getTime() && e.name === event.summary)) {
                    await Discord.createEvent({
                        name: event.summary,
                        scheduledStartTime: new Date(event.start.dateTime),
                        scheduledEndTime: new Date(event.end.dateTime),
                        privacyLevel: DiscordJs.GuildScheduledEventPrivacyLevel.GuildOnly,
                        entityType: DiscordJs.GuildScheduledEventEntityType.External,
                        description: event.description,
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
