/**
 * @typedef {import("@googleapis/calendar").calendar_v3.Schema$Event} Google.Calendar.Event
 */

const calendar = require("@googleapis/calendar").calendar({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY
});

//   ###           ##                      #
//  #   #           #                      #
//  #       ###     #     ###   # ##    ## #   ###   # ##
//  #          #    #    #   #  ##  #  #  ##      #  ##  #
//  #       ####    #    #####  #   #  #   #   ####  #
//  #   #  #   #    #    #      #   #  #  ##  #   #  #
//   ###    ####   ###    ###   #   #   ## #   ####  #
/**
 * A class that handles calls to Google's Calendar API.
 */
class Calendar {
    //              #    ####                     #
    //              #    #                        #
    //  ###   ##   ###   ###   # #    ##   ###   ###    ###
    // #  #  # ##   #    #     # #   # ##  #  #   #    ##
    //  ##   ##     #    #     # #   ##    #  #   #      ##
    // #      ##     ##  ####   #     ##   #  #    ##  ###
    //  ###
    /**
     * Gets the next week of events.
     * @returns {Promise<Google.Calendar.Event[]>} A promise that returns the events.
     */
    static async getEvents() {
        const items = [];

        let nextPageToken = "temp";

        while (nextPageToken) {
            const res = await calendar.events.list({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                alwaysIncludeEmail: false,
                orderBy: "startTime",
                singleEvents: true,
                timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                timeMin: new Date().toISOString(),
                timeZone: "UTC"
            });

            if (res.status !== 200) {
                throw new Error(`There was an error while getting Calendar events from Google: status ${res.status}`);
            }

            nextPageToken = res.data.nextPageToken;

            items.push(...res.data.items);
        }

        return items;
    }
}

module.exports = Calendar;
