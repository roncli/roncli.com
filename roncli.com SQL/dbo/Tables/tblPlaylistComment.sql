CREATE TABLE [dbo].[tblPlaylistComment] (
    [CommentID]     INT      IDENTITY (1, 1) NOT NULL,
    [PlaylistID]    VARCHAR(1024)      NOT NULL,
    [Comment]       TEXT     NOT NULL,
    [CrDate]        DATETIME CONSTRAINT [DF_tblPlaylistComment_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]      INT      NOT NULL,
    [ModeratedDate] DATETIME NULL,
    CONSTRAINT [PK_tblPlaylistComment] PRIMARY KEY CLUSTERED ([CommentID] ASC),
    CONSTRAINT [FK_tblPlaylistComment_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

