declare namespace TrackTypes {
    type Track = {
        kind: string
        id: number
        created_at: Date
        user_id: number
        duration: number
        commentable: boolean
        comment_count: number
        state: string
        original_content_size: number
        last_modified: Date
        sharing: string
        tag_list: string
        permalink: string
        streamble: boolean
        embeddable_by: string
        purchase_url?: string
        purchase_title?: string
        label_id?: number
        genre: string
        title: string
        description: string
        label_name?: string
        release?: string
        track_type?: string
        key_signature?: string
        isrc?: string
        video_url?: string
        bpm?: number
        release_year?: number
        release_month?: number
        release_day?: number
        original_format: string
        license: string
        uri: string
        user: {
            id: number
            kind: string
            permalink: string
            username: string
            last_modified: Date
            uri: string
            permalink_url: string
            avatar_url: string
        }
        user_uri: string
        permalink_url: string
        artwork_url?: string
        stream_url: string
        download_url?: string
        waveform_url: string
        domain_lockings?: string
        available_country_codes?: string
        label?: string
        secret_token?: string
        secret_uri?: string
        user_favorite?: boolean
        user_playback_count?: number
        playback_count: number
        download_count: number
        favoritings_count: number
        reposts_count: number
        downloadable: boolean
        downloads_remaining?: number
    }
}

export = TrackTypes
