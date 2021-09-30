import MongoDb from "mongodb"

declare namespace AllowedPlaylistTypes {
    type AllowedPlaylistData = {
        playlistId: string
    }
}

export = AllowedPlaylistTypes
