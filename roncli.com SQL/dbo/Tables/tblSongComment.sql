CREATE TABLE [dbo].[tblSongComment] (
    [CommentID]     INT      IDENTITY (1, 1) NOT NULL,
    [SongID]        INT      NOT NULL,
    [UserID]        INT      NOT NULL,
    [Comment]       TEXT     NOT NULL,
    [CrDate]        DATETIME CONSTRAINT [DF_tblSongComment_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [ModeratedDate] DATETIME NULL,
    CONSTRAINT [PK_tblSongComment] PRIMARY KEY CLUSTERED ([CommentID] ASC),
    CONSTRAINT [FK_tblSongComment_tblSong] FOREIGN KEY ([SongID]) REFERENCES [dbo].[tblSong] ([SongID]),
    CONSTRAINT [FK_tblSongComment_tblUser] FOREIGN KEY ([UserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

