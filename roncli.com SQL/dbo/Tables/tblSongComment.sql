CREATE TABLE [dbo].[tblSongComment] (
    [CommentID]     INT           NOT NULL IDENTITY,
    [SongURL]       VARCHAR(1024) NOT NULL,
    [Comment]       TEXT          NOT NULL,
    [CrDate]        DATETIME      CONSTRAINT [DF_tblSongComment_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]      INT           NOT NULL,
    [ModeratedDate] DATETIME      NULL,
    CONSTRAINT [PK_tblSongComment] PRIMARY KEY CLUSTERED ([CommentID] ASC),
    CONSTRAINT [FK_tblSongComment_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

