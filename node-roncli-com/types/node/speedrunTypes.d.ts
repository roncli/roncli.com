declare namespace SpeedrunTypes {
    type Speedrun = {
        game: string
        gameId: string
        category: string
        place: number
        url: string
        video: string
        date: Date
        time: number
        variables: string[]
    }

    type SpeedrunData = {
        place: number
        run: {
            id: string
            weblink: string
            game: string
            level: string
            category: string
            videos: {
                links: {
                    uri: string
                }[]
            }
            comment: string
            status: {
                status: string
                examiner: string
                "verify-date": Date
            }
            players: {
                rel: string
                id: string
                uri: string
            }[]
            date: Date
            submitted: Date
            times: {
                primary: string
                primary_t: number
                realtime: string
                realtime_t: number
                realtime_noloads: string
                realtime_noloads_t: number
                ingame: string
                ingame_t: number
            }
            system: {
                platform: string
                emulated: boolean
                region: string
            }
            splits: {
                rel: string
                uri: string
            }
            values: {
                [x: string]: string
            }
            links: {
                rel: string
                uri: string
            }[]
        }
        game: {
            data: {
                id: string
                names: {
                    international: string
                    japanese: string
                    twitch: string
                }
                abbreviation: string
                weblink: string
                released: number
                "release-date": Date
                ruleset: {
                    "show-milliseconds": boolean
                    "require-verification": boolean
                    "require-video": boolean
                    "run-times": string[]
                    "default-time": string
                    "emulators-allowed": boolean
                }
                romhack: boolean
                gametypes: string[]
                platforms: string[]
                regions: string[]
                genres: string[]
                engines: string[]
                developers: string[]
                publishers: string[]
                moderators: {
                    [x: string]: string
                }
                created: Date
                assets: {
                    [x: string]: {
                        uri: string
                        width: number
                        height: number
                    } | null
                }
                links: {
                    rel: string
                    uri: string
                }[]
            }
        }
        category: {
            data: {
                id: string
                name: string
                weblink: string
                type: string
                rules: string
                players: {
                    type: string
                    value: number
                }
                miscellaneous: boolean
                links: {
                    rel: string
                    uri: string
                }[]
            }
        }
    }

    type VariableData = {
        id: string
        name: string
        category: string
        scope: {
            type: string
        }
        mandatory: boolean
        "user-defined": boolean
        obsolets: boolean
        values: {
            values: {
                [x: string]: {
                    label: string
                    rules: string
                    flags: {
                        miscellaneous: boolean
                    }
                }
            }
            default: string
        }
        "is-subcategory": boolean
        links: {
            rel: string
            uri: string
        }[]
    }
}

export = SpeedrunTypes
