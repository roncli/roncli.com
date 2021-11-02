const BlizzardJs = require("blizzard.js");

//  ####    ##      #                                    #
//   #  #    #                                           #
//   #  #    #     ##    #####  #####   ###   # ##    ## #
//   ###     #      #       #      #       #  ##  #  #  ##
//   #  #    #      #      #      #     ####  #      #   #
//   #  #    #      #     #      #     #   #  #      #  ##
//  ####    ###    ###   #####  #####   ####  #       ## #
/**
 * A class that handles calls to Blizzard's API.
 */
class Blizzard {
    //              #    ###    #          #     ##          ####   ##   #                              #
    //              #    #  #              #      #             #  #  #  #                              #
    //  ###   ##   ###   #  #  ##     ###  ###    #     ##    ##   #     ###    ###  ###    ###   ##   ###    ##   ###    ###
    // #  #  # ##   #    #  #   #    #  #  #  #   #    #  #     #  #     #  #  #  #  #  #  #  #  #      #    # ##  #  #  ##
    //  ##   ##     #    #  #   #    # ##  #  #   #    #  #  #  #  #  #  #  #  # ##  #     # ##  #      #    ##    #       ##
    // #      ##     ##  ###   ###    # #  ###   ###    ##    ##    ##   #  #   # #  #      # #   ##     ##   ##   #     ###
    //  ###
    /**
     * Gets the Diablo 3 characters.
     * @returns {Promise<any>} A promise that returns the Diablo 3 characters.
     */
    static async getDiablo3Characters() {
        const client = await BlizzardJs.d3.createInstance({
            key: process.env.BLIZZARD_CLIENT_ID,
            secret: process.env.BLIZZARD_CLIENT_SECRET,
            origin: "us",
            locale: "en_US"
        });

        const res = await client.accountProfile({account: "roncli-1818"});

        if (res.status !== 200) {
            throw new Error(`There was an error while getting the D3 characters from Blizzard: status ${res.status}`);
        }

        return res.data;
    }

    //              #    #  #               ##         #      #                                         #
    //              #    #  #              #  #        #                                                #
    //  ###   ##   ###   #  #   ##   #  #  #  #   ##   ###   ##     ##   # #    ##   # #    ##   ###   ###
    // #  #  # ##   #    ####  #  #  #  #  ####  #     #  #   #    # ##  # #   # ##  ####  # ##  #  #   #
    //  ##   ##     #    ####  #  #  ####  #  #  #     #  #   #    ##    # #   ##    #  #  ##    #  #   #
    // #      ##     ##  #  #   ##   ####  #  #   ##   #  #  ###    ##    #     ##   #  #   ##   #  #    ##
    //  ###
    /**
     * Gets the WoW achievement.
     * @returns {Promise<{info: any, media: any}>} A promise that returns the WoW achievement.
     */
    static async getWowAchievement(id) {
        const client = await BlizzardJs.wow.createInstance({
            key: process.env.BLIZZARD_CLIENT_ID,
            secret: process.env.BLIZZARD_CLIENT_SECRET,
            origin: "us",
            locale: "en_US"
        });

        const data = {info: void 0, media: void 0};

        await Promise.all([
            (async () => {
                const res = await client.achievement({id});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting WoW achievement ${id} from Blizzard: status ${res.status}`);
                }

                data.info = res.data;
            })(),
            (async () => {
                const res = await client.achievement({id, media: true});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting WoW achievement ${id} from Blizzard: status ${res.status}`);
                }

                data.media = res.data;
            })()
        ]);

        return data;
    }

    //              #    #  #               ##   #                              #
    //              #    #  #              #  #  #                              #
    //  ###   ##   ###   #  #   ##   #  #  #     ###    ###  ###    ###   ##   ###    ##   ###
    // #  #  # ##   #    ####  #  #  #  #  #     #  #  #  #  #  #  #  #  #      #    # ##  #  #
    //  ##   ##     #    ####  #  #  ####  #  #  #  #  # ##  #     # ##  #      #    ##    #
    // #      ##     ##  #  #   ##   ####   ##   #  #   # #  #      # #   ##     ##   ##   #
    //  ###
    /**
     * Gets the WoW character.
     * @returns {Promise<{profile: any, media: any, achievements: any}>} A promise that returns the WoW character.
     */
    static async getWowCharacter() {
        const client = await BlizzardJs.wow.createInstance({
            key: process.env.BLIZZARD_CLIENT_ID,
            secret: process.env.BLIZZARD_CLIENT_SECRET,
            origin: "us",
            locale: "en_US"
        });

        const data = {profile: void 0, media: void 0, achievements: void 0};

        await Promise.all([
            (async () => {
                const res = await client.characterProfile({name: "roncli", realm: "senjin"});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting the WoW character profile from Blizzard: status ${res.status}`);
                }

                data.profile = res.data;
            })(),
            (async () => {
                const res = await client.characterMedia({name: "roncli", realm: "senjin"});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting the WoW character media from Blizzard: status ${res.status}`);
                }

                data.media = res.data;
            })(),
            (async () => {
                const res = await client.characterAchievements({name: "roncli", realm: "senjin"});

                if (res.status !== 200) {
                    throw new Error(`There was an error while getting the WoW character achievements from Blizzard: status ${res.status}`);
                }

                data.achievements = res.data;
            })()
        ]);

        return data;
    }
}

module.exports = Blizzard;
