declare namespace PhotoTypes {
    type AlbumData = {
        ID?: number
        UID: string
        ParentUID: string
        Thumb: string
        Slug: string
        Type: string
        Title: string
        Location: string
        Category: string
        Caption: string
        Description: string
        Notes: string
        Filter: string
        Order: string
        Template: string
        Path?: string
        Country: string
        Year: number
        Month: number
        Day: number
        Favorite: boolean
        Private: boolean
        PhotoCount?: number
        LinkCount?: number
        CreatedAt: string
        UpdatedAt: string
        DeletedAt?: string
        Photos?: PhotoData[]
    }

    type PhotoData = {
        ID: string
        UID: string
        Type: string
        TypeSrc: string
        TakenAt: string
        TakenAtLocal: string
        TakenSrc: string
        TimeZone: string
        Path: string
        Name: string
        OriginalName: string
        Title: string
        Description: string
        Year: number
        Month: number
        Day: number
        Country: string
        Stack: number
        Favorite: boolean
        Private: boolean
        Iso: number
        FocalLength: number
        FNumber: number
        Exposure: string
        Quality: number
        Resolution: number
        Color: number
        Scan: boolean
        Panorama: boolean
        CameraID: number
        CameraModel: string
        CameraMake: string
        LensID: number
        LensModel: string
        LensMake: string
        Lat: number
        Lng: number
        CellID: string
        PlaceID: string
        PlaceSrc: string
        PlaceLabel: string
        PlaceCity: string
        PlaceCountry: string
        InstanceID: string
        FileUID: string
        FileRoot: string
        FileName: string
        Hash: string
        Width: number
        Height: number
        Portrait: boolean
        Merged: boolean
        CreatedAt: string
        UpdatedAt: string
        EditedAt: string
        CheckedAt: string
        DeletedAt?: string
    }
}

export = PhotoTypes
