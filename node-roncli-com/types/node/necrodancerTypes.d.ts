declare namespace NecroDancerTypes {
    type RunData = {
        name: string
        rank: number
        score: number
        run: string
        end: {
            zone: number
            level: number
        }
        url: string
    }

    type ToofzData = {
        player: {
            id: string
            updated_at: Date
            display_name: string
            avatar: string
        }
        total: number
        entries: {
            leaderboard: {
                id: number
                updated_at: Date
                name: string
                display_name: string
                production: boolean
                product: string
                _product: {
                    id: number
                    name: string
                    display_name: string
                }
                mode: string
                _mode: {
                    id: number
                    name: string
                    display_name: string
                }
                run: string
                _run: {
                    id: number
                    name: string
                    display_name: string
                }
                character: string
                _character: {
                    id: number
                    name: string
                    display_name: string
                }
                coOp: boolean
                customMusic: boolean
                total: number
            }
            rank: number
            score: number
            end: {
                zone: number
                level: number
            }
            killed_by: string
            version: number
        }[]
    }
}

export = NecroDancerTypes
