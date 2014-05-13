CREATE TABLE [dbo].[tblSongFeature] (
    [FeatureID] INT      IDENTITY (1, 1) NOT NULL,
    [SongID]    INT      NOT NULL,
    [Order]     INT      NOT NULL,
    [CrDate]    DATETIME CONSTRAINT [DF_tblSongFeature_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblSongFeature] PRIMARY KEY CLUSTERED ([FeatureID] ASC),
    CONSTRAINT [FK_tblSongFeature_tblSong] FOREIGN KEY ([SongID]) REFERENCES [dbo].[tblSong] ([SongID])
);

