CREATE TABLE [dbo].[tblSong] (
    [SongID]      INT           IDENTITY (1, 1) NOT NULL,
    [Title]       VARCHAR (255) NOT NULL,
    [URL]         VARCHAR (255) NOT NULL,
    [Artist]      VARCHAR (255) NOT NULL,
    [Description] TEXT          NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblSong_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblSong_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblSong] PRIMARY KEY CLUSTERED ([SongID] ASC)
);

