declare namespace ProfileTypes {
    type D3Data = {
        id: number
        name: string
        class: string
        level: number
        eliteKills: number
        paragon: number
        hardcore: boolean
        seasonal: boolean
        lastUpdated: Date
    }

    type FF14Data = {
        id: number
        name: string
        race: string
        job: string
        server: string
        dataCenter: string
        freeCompany: string
        level: number
        title: string
        titleTop: boolean
        achievementPoints: number
        recentAchievements: {
            id: string
            name: string
            timestamp: Date
        }[]
        avatarUrl: string
        portraitUrl: string
    }

    type WowData = {
        id: number
        name: string
        race: string
        class: string
        realm: string
        guild: string
        level: number
        title: string
        achievementPoints: number
        recentAchievements: {
            id: number
            name: string
            timestamp: Date
        }[]
        avatarUrl: string
        insetUrl: string
    }
}

export = ProfileTypes
