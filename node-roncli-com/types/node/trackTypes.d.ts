declare namespace TrackTypes {
    type Track = {
        kind: string
        id: number
        created_at: Date
        duration: number
        commentable: boolean
        comment_count: number
        sharing: string
        tag_list: string
        streamble: boolean
        embeddable_by: string
        purchase_url: string
        purchase_title: string
        genre: string
        title: string
        description: string
        label_name: string
        release: string
        key_signature: string
        isrc: string
        bpm: number
        release_year: number
        release_month: number
        release_day: number
        license: string
        uri: string
        user: {
            avatar_url: string
            id: number
            kind: string
            permalink_url: string
            uri: string
            username: string
            permalink: string
            created_at: Date
            last_modified: Date
            first_name: string
            last_name: string
            full_name: string
            city: string
            description: string
            country: string
            track_count: number
            public_favorites_count: number
            reposts_count: number
            followings_count: number
            plan: string
            myspace_name: string
            discogs_name: string
            website_title: string
            website: string
            comments_count: number
            online: boolean
            likes_count: number
            playlist_count: number
            subscriptions: {
                product: {
                    id: string
                    name: string
                }
            }[]
        }
        permalink_url: string
        artwork_url: string
        stream_url: string
        download_url: string
        waveform_url: string
        available_country_codes: string
        secret_uri: string
        user_favorite: boolean
        user_playback_count: number
        playback_count: number
        download_count: number
        favoritings_count: number
        reposts_count: number
        downloadable: boolean
        access: string
        policy: string
        monetization_model: string
    }

    type TrackInfo = {
        id: number
        user: {username: string}
        title: string
        uri: string
        permalink_url: string
        description: string
    }
}

export = TrackTypes
