CREATE TABLE [dbo].[tblSongFile] (
    [FileID]          INT           IDENTITY (1, 1) NOT NULL,
    [SongID]          INT           NOT NULL,
    [Title]           VARCHAR (255) NOT NULL,
    [Filename]        VARCHAR (255) NOT NULL,
    [Description]     TEXT          NOT NULL,
    [Order]           INT           NOT NULL,
    [Format]          VARCHAR (10)  NOT NULL,
    [Bytes]           BIGINT        NOT NULL,
    [Milliseconds]    INT           NULL,
    [PrimaryDownload] BIT           NOT NULL,
    [Stream]          BIT           NOT NULL,
    [CrDate]          DATETIME      CONSTRAINT [DF_tblSongFile_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]         DATETIME      CONSTRAINT [DF_tblSongFile_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblSongFile] PRIMARY KEY CLUSTERED ([FileID] ASC),
    CONSTRAINT [FK_tblSongFile_tblSong] FOREIGN KEY ([SongID]) REFERENCES [dbo].[tblSong] ([SongID])
);

