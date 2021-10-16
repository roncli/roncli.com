//  #####    #
//    #
//    #     ##    ## #    ###
//    #      #    # # #  #   #
//    #      #    # # #  #####
//    #      #    # # #  #
//    #     ###   #   #   ###
/**
 * A class that provides functions to deal with time.
 */
class Time {
    //   #                            #    ###    #
    //  # #                           #     #
    //  #     ##   ###   # #    ###  ###    #    ##    # #    ##
    // ###   #  #  #  #  ####  #  #   #     #     #    ####  # ##
    //  #    #  #  #     #  #  # ##   #     #     #    #  #  ##
    //  #     ##   #     #  #   # #    ##   #    ###   #  #   ##
    /**
     * Formats the time portion of the date.
     * @param {Date} time The time to display.
     * @returns {string} The formatted time.
     */
    static formatTime(time) {
        return `${time.getHours() === 0 ? 12 : time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()} ${time.getHours() < 12 ? "AM" : "PM"}`;
    }

    //   #                            #    ###          #
    //  # #                           #    #  #         #
    //  #     ##   ###   # #    ###  ###   #  #   ###  ###    ##
    // ###   #  #  #  #  ####  #  #   #    #  #  #  #   #    # ##
    //  #    #  #  #     #  #  # ##   #    #  #  # ##   #    ##
    //  #     ##   #     #  #   # #    ##  ###    # #    ##   ##
    /**
     * Formats the date to show in the user's time zone.
     * @param {Date} time The date and time to display.
     * @returns {string} The formatted date and time.
     */
    static formatDate(time) {
        const now = new Date(),
            today = new Date(now);

        today.setMilliseconds(0);
        today.setSeconds(0);
        today.setMinutes(0);
        today.setHours(0);

        const date = new Date(time);

        date.setMilliseconds(0);
        date.setSeconds(0);
        date.setMinutes(0);
        date.setHours(0);

        switch (date.getTime() - today.getTime()) {
            case 0:
                return `Today ${this.formatTime(time)}`;
            case 86400000:
                return `Tomorrow ${this.formatTime(time)}`;
            case -86400000:
                return `Yesterday ${this.formatTime(time)}`;
            default:
                return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][time.getMonth()]} ${time.getDate()}, ${time.getFullYear()} ${this.formatTime(time)}`;
        }
    }

    //   #                            #    ###          #           ##         ##
    //  # #                           #    #  #         #          #  #         #
    //  #     ##   ###   # #    ###  ###   #  #   ###  ###    ##   #  #  ###    #    #  #
    // ###   #  #  #  #  ####  #  #   #    #  #  #  #   #    # ##  #  #  #  #   #    #  #
    //  #    #  #  #     #  #  # ##   #    #  #  # ##   #    ##    #  #  #  #   #     # #
    //  #     ##   #     #  #   # #    ##  ###    # #    ##   ##    ##   #  #  ###     #
    //                                                                                #
    /**
     * Formats the date.
     * @param {Date} time The date to display.
     * @returns {string} The formatted date.
     */
    static formatDateOnly(time) {
        const now = new Date(),
            today = new Date(now);

        today.setMilliseconds(0);
        today.setSeconds(0);
        today.setMinutes(0);
        today.setHours(0);

        const date = new Date(time);

        date.setMilliseconds(0);
        date.setSeconds(0);
        date.setMinutes(0);
        date.setHours(0);

        switch (date.getTime() - today.getTime()) {
            case 0:
                return "Today";
            case 86400000:
                return "Tomorrow";
            case -86400000:
                return "Yesterday";
            default:
                return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;
        }
    }

    //   #                            #    ###    #
    //  # #                           #     #
    //  #     ##   ###   # #    ###  ###    #    ##    # #    ##    ###   ###    ###  ###
    // ###   #  #  #  #  ####  #  #   #     #     #    ####  # ##  ##     #  #  #  #  #  #
    //  #    #  #  #     #  #  # ##   #     #     #    #  #  ##      ##   #  #  # ##  #  #
    //  #     ##   #     #  #   # #    ##   #    ###   #  #   ##   ###    ###    # #  #  #
    //                                                                    #
    /**
     * Formats a timespan.
     * @param {number} time The number of seconds.
     * @param {number} [digits] The number of fractional second digits.
     * @returns {string} A string representing the timespan.
     */
    static formatTimespan(time, digits) {
        if (!time) {
            return "";
        }

        time = +time.toFixed(digits);
        return `${Math.floor(time / 3600)}:${(Math.floor(time / 60) % 60).toLocaleString("en-US", {minimumIntegerDigits: 2})}:${(time % 60).toLocaleString("en-US", {minimumIntegerDigits: 2, minimumFractionDigits: digits})}`;
    }
}

if (typeof module === "undefined") {
    window.Time = Time;
} else {
    module.exports = Time; // eslint-disable-line no-undef
}
