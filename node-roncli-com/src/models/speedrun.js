/**
 * @typedef {import("../../types/node/speedrunTypes").Speedrun} SpeedrunTypes.Speedrun
 * @typedef {import("../../types/node/speedrunTypes").VariableData} SpeedrunTypes.VariableData
 */

const Cache = require("@roncli/node-redis").Cache,
    HashCache = require("@roncli/node-redis").HashCache,
    Log = require("@roncli/node-application-insights-logger"),
    SortedSetCache = require("@roncli/node-redis").SortedSetCache,
    SpeedrunCom = require("../speedrun.com");

//   ###                            #
//  #   #                           #
//  #      # ##    ###    ###    ## #  # ##   #   #  # ##
//   ###   ##  #  #   #  #   #  #  ##  ##  #  #   #  ##  #
//      #  ##  #  #####  #####  #   #  #      #   #  #   #
//  #   #  # ##   #      #      #  ##  #      #  ##  #   #
//   ###   #       ###    ###    ## #  #       ## #  #   #
//         #
//         #
/**
 * A class that represents a speedrun.
 */
class Speedrun {
    //                   #            ##                        #
    //                   #           #  #                       #
    //  ##    ###   ##   ###    ##    #    ###    ##    ##    ###  ###   #  #  ###    ###
    // #     #  #  #     #  #  # ##    #   #  #  # ##  # ##  #  #  #  #  #  #  #  #  ##
    // #     # ##  #     #  #  ##    #  #  #  #  ##    ##    #  #  #     #  #  #  #    ##
    //  ##    # #   ##   #  #   ##    ##   ###    ##    ##    ###  #      ###  #  #  ###
    //                                     #
    /**
     * Caches the speedruns.
     * @returns {Promise} A promise that resolves when the speedruns have been cached.
     */
    static async cacheSpeedruns() {
        // Get the speedruns from speedrun.com.
        const speedrunData = await SpeedrunCom.getSpeedruns();

        // Get the games.
        /** @type {{[x: string]: {name: string, runs: any[]}}} */
        const speedrunsByGame = {};

        speedrunData.forEach((speedrun) => {
            if (!speedrunsByGame[speedrun.game.data.id]) {
                speedrunsByGame[speedrun.game.data.id] = {
                    name: speedrun.game.data.names.international,
                    runs: []
                };
            }

            speedrunsByGame[speedrun.game.data.id].runs.push(speedrun);
        });

        // Get the unique games.
        const games = Object.keys(speedrunsByGame);

        // Get variables for the games.
        /** @type {{[x: string]: SpeedrunTypes.VariableData[]}} */
        const variables = {};

        await Promise.all(games.map((game) => (async () => {
            variables[game] = await SpeedrunCom.getVariables(game);
        })()));

        // Map the data to an array.
        const speedruns = speedrunData.filter((speedrun) => {
            if (!speedrun.run.values) {
                return true;
            }

            return Object.keys(speedrun.run.values).map((value) => {
                const data = variables[speedrun.run.game];

                if (!data) {
                    return void 0;
                }

                const variable = data.find((d) => d.id === value);

                if (!variable) {
                    return void 0;
                }

                const variableValue = variable.values.values[speedrun.run.values[value]];

                if (!variableValue) {
                    return void 0;
                }

                return variableValue.flags && variableValue.flags.miscellaneous || false;
            }).filter((v) => v).length === 0;
        }).map((speedrun) => ({
            score: speedrun.place * 1000000 + speedrun.run.times.primary_t,
            value: {
                game: speedrun.game.data.names.international,
                gameId: speedrun.game.data.id,
                category: speedrun.category.data.name,
                place: speedrun.place,
                url: speedrun.run.weblink,
                video: speedrun.run.videos && speedrun.run.videos.links && speedrun.run.videos.links[0] && speedrun.run.videos.links[0].uri || void 0,
                date: new Date(speedrun.run.date),
                time: speedrun.run.times.primary_t,
                variables: speedrun.run.values ? Object.keys(speedrun.run.values).map((value) => {
                    const data = variables[speedrun.run.game];

                    if (!data) {
                        return void 0;
                    }

                    const variable = data.find((d) => d.id === value);

                    if (!variable) {
                        return void 0;
                    }

                    const variableValue = variable.values.values[speedrun.run.values[value]];

                    if (!variableValue) {
                        return void 0;
                    }

                    return variableValue.label;
                }).filter((v) => v) : []
            }
        }));

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 1);

        await Promise.all([
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:speedrun.com:speedruns`, speedruns, expire),
            HashCache.add(`${process.env.REDIS_PREFIX}:speedrun.com:games`, Object.keys(speedrunsByGame).map((id) => ({
                key: id,
                value: {
                    name: speedrunsByGame[id].name,
                    runs: speedrunsByGame[id].runs.map((run) => ({
                        game: run.game.data.names.international,
                        gameId: run.game.data.id,
                        category: run.category.data.name,
                        place: run.place,
                        url: run.run.weblink,
                        video: run.run.videos && run.run.videos.links && run.run.videos.links[0] && run.run.videos.links[0].uri || void 0,
                        date: new Date(run.run.date),
                        time: run.run.times.primary_t,
                        variables: run.run.values ? Object.keys(run.run.values).map((value) => {
                            const data = variables[run.run.game];

                            if (!data) {
                                return void 0;
                            }

                            const variable = data.find((d) => d.id === value);

                            if (!variable) {
                                return void 0;
                            }

                            const variableValue = variable.values.values[run.run.values[value]];

                            if (!variableValue) {
                                return void 0;
                            }

                            return variableValue.label;
                        }).filter((v) => v) : []
                    }))
                }
            })))
        ]);
    }

    //              #     ##
    //              #    #  #
    //  ###   ##   ###   #      ###  # #    ##
    // #  #  # ##   #    # ##  #  #  ####  # ##
    //  ##   ##     #    #  #  # ##  #  #  ##
    // #      ##     ##   ###   # #  #  #   ##
    //  ###
    /**
     * Gets a speedrun game.
     * @param {string} id The game ID.
     * @returns {Promise<{name: string, runs: Speedrun[]}>} A promise that returns the speedrun game's data.
     */
    static async getGame(id) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:speedrun.com:games`])) {
                await Speedrun.cacheSpeedruns();
            }

            const data = await HashCache.get(`${process.env.REDIS_PREFIX}:speedrun.com:games`, id);

            if (!data) {
                return void 0;
            }

            return {
                name: data.name,
                runs: data.runs.map((s) => new Speedrun(s))
            };
        } catch (err) {
            Log.error("There was an error while getting a speedrun game.", {err});
            return void 0;
        }
    }

    //              #     ##                        #
    //              #    #  #                       #
    //  ###   ##   ###    #    ###    ##    ##    ###  ###   #  #  ###    ###
    // #  #  # ##   #      #   #  #  # ##  # ##  #  #  #  #  #  #  #  #  ##
    //  ##   ##     #    #  #  #  #  ##    ##    #  #  #     #  #  #  #    ##
    // #      ##     ##   ##   ###    ##    ##    ###  #      ###  #  #  ###
    //  ###                    #
    /**
     * Gets a list of speedruns.
     * @param {number} offset The speedrun to start from.
     * @param {number} count The number of speedruns to retrieve.
     * @returns {Promise<Speedrun[]>} A promise that returns the speedruns.
     */
    static async getSpeedruns(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:speedrun.com:speedruns`])) {
                await Speedrun.cacheSpeedruns();
            }

            return (await SortedSetCache.get(`${process.env.REDIS_PREFIX}:speedrun.com:speedruns`, offset, offset + count - 1)).map((s) => new Speedrun(s));
        } catch (err) {
            Log.error("There was an error while getting speedruns.", {err});
            return void 0;
        }
    }

    //              #     ##                        #                           ###          ##
    //              #    #  #                       #                           #  #        #  #
    //  ###   ##   ###    #    ###    ##    ##    ###  ###   #  #  ###    ###   ###   #  #  #      ###  # #    ##
    // #  #  # ##   #      #   #  #  # ##  # ##  #  #  #  #  #  #  #  #  ##     #  #  #  #  # ##  #  #  ####  # ##
    //  ##   ##     #    #  #  #  #  ##    ##    #  #  #     #  #  #  #    ##   #  #   # #  #  #  # ##  #  #  ##
    // #      ##     ##   ##   ###    ##    ##    ###  #      ###  #  #  ###    ###     #    ###   # #  #  #   ##
    //  ###                    #                                                       #
    /**
     * Gets speedruns by game.
     * @returns {Promise<{[x: string]: Speedrun[]}>} A promise that returns the speedruns by game.
     */
    static async getSpeedrunsByGame() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:speedrun.com:speedruns`])) {
                await Speedrun.cacheSpeedruns();
            }

            const speedruns = (await SortedSetCache.get(`${process.env.REDIS_PREFIX}:speedrun.com:speedruns`, 0, -1)).map((s) => new Speedrun(s));

            /** @type {{[x: string]: Speedrun[]}} */
            const speedrunsByGame = {};

            speedruns.forEach((speedrun) => {
                if (!speedrunsByGame[speedrun.game]) {
                    speedrunsByGame[speedrun.game] = [];
                }

                speedrunsByGame[speedrun.game].push(speedrun);
            });

            return speedrunsByGame;
        } catch (err) {
            Log.error("There was an error while getting speedruns.", {err});
            return void 0;
        }
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new speedrun object.
     * @param {SpeedrunTypes.Speedrun} data The speedrun data.
     */
    constructor(data) {
        this.game = data.game;
        this.gameId = data.gameId;
        this.category = data.category;
        this.place = data.place;
        this.url = data.url;
        this.video = data.video;
        this.date = new Date(data.date);
        this.time = data.time;
        this.variables = data.variables;
    }
}

module.exports = Speedrun;
