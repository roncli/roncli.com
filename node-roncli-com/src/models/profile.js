/**
 * @typedef {import("../../types/node/profileTypes").D3Data} ProfileTypes.D3Data
 * @typedef {import("../../types/node/profileTypes").FF14Data} ProfileTypes.FF14Data
 * @typedef {import("../../types/node/profileTypes").WowData} ProfileTypes.WowData
 */

const Blizzard = require("../blizzard"),
    Cache = require("@roncli/node-redis").Cache,
    FinalFantasy = require("../finalFantasy"),
    HashCache = require("@roncli/node-redis").HashCache,
    Log = require("@roncli/node-application-insights-logger"),
    SortedSetCache = require("@roncli/node-redis").SortedSetCache;

//  ####                   ##     #     ##
//  #   #                 #  #           #
//  #   #  # ##    ###    #      ##      #     ###
//  ####   ##  #  #   #  ####     #      #    #   #
//  #      #      #   #   #       #      #    #####
//  #      #      #   #   #       #      #    #
//  #      #       ###    #      ###    ###    ###
/**
 * A class that gets various gaming profiles.
 */
class Profile {
    //                   #           ###   ####
    //                   #           #  #     #
    //  ##    ###   ##   ###    ##   #  #   ##
    // #     #  #  #     #  #  # ##  #  #     #
    // #     # ##  #     #  #  ##    #  #  #  #
    //  ##    # #   ##   #  #   ##   ###    ##
    /**
     * Caches the Diablo 3 data.
     * @returns {Promise} A promise that resolves when the Diablo 3 data is cached.
     */
    static async cacheD3() {
        // Retrieve the data from Blizzard.
        const data = (await Blizzard.getDiablo3Characters()).heroes.filter((h) => !h.dead).map((hero) => ({
            score: (hero.seasonal ? 1000000000 : 0) + (hero.hardcore ? 100000000 : 0) + (hero.kills ? hero.kills.elites : 0),
            value: {
                id: hero.id,
                name: hero.name,
                class: /** @type {string} */(hero.class).split("-").map((s) => `${s.substr(0, 1).toLocaleUpperCase()}${s.substr(1)}`).join(" "), // eslint-disable-line no-extra-parens
                level: hero.level,
                eliteKills: hero.kills ? hero.kills.elites : 0,
                paragon: hero.paragonLevel || 0,
                hardcore: hero.hardcore,
                seasonal: hero.seasonal,
                lastUpdated: new Date(hero["last-updated"])
            }
        }));

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await SortedSetCache.add(`${process.env.REDIS_PREFIX}:d3:profile`, data, expire);
    }

    //                   #           ####  ####   #      #
    //                   #           #     #     ##     ##
    //  ##    ###   ##   ###    ##   ###   ###    #    # #
    // #     #  #  #     #  #  # ##  #     #      #    ####
    // #     # ##  #     #  #  ##    #     #      #      #
    //  ##    # #   ##   #  #   ##   #     #     ###     #
    /**
     * Caches the Final Fantasy 14 data.
     * @returns {Promise} A promise that resolves when the Final Fantasy 14 data is cached.
     */
    static async cacheFF14() {
        // Retrieve the data from Square Enix.
        const data = await FinalFantasy.getCharacter();

        if (data.Error) {
            Log.error("There was an error while caching the Final Fantasy XIV profiles.", {err: new Error(data.Subject), properties: {message: data.Message, debug: data.Debug}});
            return;
        }

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await Cache.add(`${process.env.REDIS_PREFIX}:ff14:profile`, {
            id: data.character.id,
            name: data.character.name,
            race: data.character.race.name,
            job: data.character.active_class_job.job.name.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()),
            server: data.character.server,
            dataCenter: data.character.dc,
            freeCompany: data.free_company ? data.free_company.name : void 0,
            level: data.character.active_class_job.level,
            title: data.character.title ? data.character.title.name : void 0,
            titleTop: data.character.title_top,
            achievementPoints: data.achievements.points,
            recentAchievements: data.achievements.list.sort((a, b) => b.date - a.date).slice(0, 10).map((a) => ({
                id: a.id,
                name: a.name,
                timestamp: new Date(a.date * 1000),
                icon: a.icon,
                points: a.points
            })),
            avatarUrl: data.character.avatar,
            portraitUrl: data.character.portrait
        }, expire);
    }

    //                   #           #  #        #  #
    //                   #           #  #        #  #
    //  ##    ###   ##   ###    ##   #  #   ##   #  #
    // #     #  #  #     #  #  # ##  ####  #  #  ####
    // #     # ##  #     #  #  ##    ####  #  #  ####
    //  ##    # #   ##   #  #   ##   #  #   ##   #  #
    /**
     * Caches the WoW data.
     * @returns {Promise} A promise that resolves when the WoW data is cached.
     */
    static async cacheWoW() {
        // Retrieve the data from Blizzard.
        const data = await Blizzard.getWowCharacter();

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        const avatar = data.media && data.media.assets && data.media.assets.find((a) => a.key === "avatar") || void 0,
            inset = data.media && data.media.assetts && data.media.assets.find((a) => a.key === "inset") || void 0;

        const achievements = await Promise.all(data.achievements.recent_events.map(async (event) => {
            if (!await HashCache.exists(`${process.env.REDIS_PREFIX}:wow:achievements`, event.achievement.id.toString())) {
                await Profile.cacheWoWAchievement(event.achievement.id);
            }

            return HashCache.get(`${process.env.REDIS_PREFIX}:wow:achievements`, event.achievement.id.toString());
        }));

        await Cache.add(`${process.env.REDIS_PREFIX}:wow:profile`, {
            id: data.profile.id,
            name: data.profile.name,
            race: data.profile.race.name,
            class: data.profile.character_class.name,
            realm: data.profile.realm.name,
            guild: data.profile.guild ? data.profile.guild.name : void 0,
            level: data.profile.level,
            title: data.profile.active_title ? data.profile.active_title.display_string : void 0,
            achievementPoints: data.achievements.total_points,
            recentAchievements: data.achievements.recent_events.map((event, index) => ({
                id: event.achievement.id,
                name: event.achievement.name,
                timestamp: new Date(event.timestamp),
                points: achievements[index] && achievements[index].info.points || void 0,
                icon: achievements[index] && achievements[index].media.assets && (achievements[index].media.assets.find((a) => a.key === "icon") || {}).value || void 0
            })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
            avatarUrl: avatar ? avatar.value : void 0,
            insetUrl: inset ? inset.value : void 0
        }, expire);
    }

    //                   #           #  #        #  #   ##         #      #                                         #
    //                   #           #  #        #  #  #  #        #                                                #
    //  ##    ###   ##   ###    ##   #  #   ##   #  #  #  #   ##   ###   ##     ##   # #    ##   # #    ##   ###   ###
    // #     #  #  #     #  #  # ##  ####  #  #  ####  ####  #     #  #   #    # ##  # #   # ##  ####  # ##  #  #   #
    // #     # ##  #     #  #  ##    ####  #  #  ####  #  #  #     #  #   #    ##    # #   ##    #  #  ##    #  #   #
    //  ##    # #   ##   #  #   ##   #  #   ##   #  #  #  #   ##   #  #  ###    ##    #     ##   #  #   ##   #  #    ##
    /**
     * Caches a single WoW achievement.
     * @param {number} id The achievement ID.
     * @returns {Promise} A promise that resolves when the WoW achievement is cached.
     */
    static async cacheWoWAchievement(id) {
        // Retrieve the data from Blizzard.
        const data = await Blizzard.getWowAchievement(id);

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 30);

        await HashCache.add(`${process.env.REDIS_PREFIX}:wow:achievements`, [{key: id.toString(), value: data}], expire);
    }

    //       ##                      ###   ####   ##               #
    //        #                      #  #     #  #  #              #
    //  ##    #     ##    ###  ###   #  #   ##   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #  #     #  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #  #  #  #  #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #     ###    ##    ##    # #   ##   #  #   ##
    /**
     * Clears the Diablo 3 cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearD3Cache() {
        const blogKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:d3:*`);
        if (blogKeys.length > 0) {
            await Cache.remove(blogKeys);
        }
    }

    //       ##                      ####  ####   #      #    ##               #
    //        #                      #     #     ##     ##   #  #              #
    //  ##    #     ##    ###  ###   ###   ###    #    # #   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #     #      #    ####  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #     #      #      #   #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #     #     #     ###     #    ##    # #   ##   #  #   ##
    /**
     * Clears the FF14 cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearFF14Cache() {
        const blogKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:ff14:*`);
        if (blogKeys.length > 0) {
            await Cache.remove(blogKeys);
        }
    }

    //       ##                      #  #        #  #   ##               #
    //        #                      #  #        #  #  #  #              #
    //  ##    #     ##    ###  ###   #  #   ##   #  #  #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  ####  #  #  ####  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     ####  #  #  ####  #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #     #  #   ##   #  #   ##    # #   ##   #  #   ##
    /**
     * Clears the WoW cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearWoWCache() {
        const blogKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:wow:*`);
        if (blogKeys.length > 0) {
            await Cache.remove(blogKeys);
        }
    }


    //              #    ###   ####  ###                 #    #    ##
    //              #    #  #     #  #  #               # #         #
    //  ###   ##   ###   #  #   ##   #  #  ###    ##    #    ##     #     ##    ###
    // #  #  # ##   #    #  #     #  ###   #  #  #  #  ###    #     #    # ##  ##
    //  ##   ##     #    #  #  #  #  #     #     #  #   #     #     #    ##      ##
    // #      ##     ##  ###    ##   #     #      ##    #    ###   ###    ##   ###
    //  ###
    /**
     * Get the Diablo 3 profiles.
     * @returns {Promise<ProfileTypes.D3Data[]>} A promise that returns the Diablo 3 profiles.
     */
    static async getD3Profiles() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:d3:profile`])) {
                await Profile.cacheD3();
            }

            return await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:d3:profile`, 0, 100);
        } catch (err) {
            Log.error("There was an error while getting the Diablo 3 profiles.", {err});
            return [];
        }
    }

    //              #    ####  ####   #      #   ###                 #    #    ##
    //              #    #     #     ##     ##   #  #               # #         #
    //  ###   ##   ###   ###   ###    #    # #   #  #  ###    ##    #    ##     #     ##
    // #  #  # ##   #    #     #      #    ####  ###   #  #  #  #  ###    #     #    # ##
    //  ##   ##     #    #     #      #      #   #     #     #  #   #     #     #    ##
    // #      ##     ##  #     #     ###     #   #     #      ##    #    ###   ###    ##
    //  ###
    /**
     * Get the Final Fantasy 14 profile.
     * @returns {Promise<ProfileTypes.FF14Data>} A promise that returns the Final Fantasy 14 profile.
     */
    static async getFF14Profile() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:ff14:profile`])) {
                await Profile.cacheFF14();
            }

            return await Cache.get(`${process.env.REDIS_PREFIX}:ff14:profile`);
        } catch (err) {
            Log.error("There was an error while getting the Final Fantasy 14 profile.", {err});
            return void 0;
        }
    }

    //              #    #  #              ###                 #    #    ##
    //              #    #  #              #  #               # #         #
    //  ###   ##   ###   #  #   ##   #  #  #  #  ###    ##    #    ##     #     ##
    // #  #  # ##   #    ####  #  #  #  #  ###   #  #  #  #  ###    #     #    # ##
    //  ##   ##     #    ####  #  #  ####  #     #     #  #   #     #     #    ##
    // #      ##     ##  #  #   ##   ####  #     #      ##    #    ###   ###    ##
    //  ###
    /**
     * Get the WoW profile.
     * @returns {Promise<ProfileTypes.WowData>} A promise that returns the WoW profile.
     */
    static async getWowProfile() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:wow:profile`])) {
                await Profile.cacheWoW();
            }

            return await Cache.get(`${process.env.REDIS_PREFIX}:wow:profile`);
        } catch (err) {
            Log.error("There was an error while getting the WoW profile.", {err});
            return void 0;
        }
    }
}

module.exports = Profile;
