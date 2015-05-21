CREATE TABLE [dbo].[tblPageComment] (
    [CommentID]     INT      NOT NULL IDENTITY,
    [PageID]        INT      NOT NULL,
    [Comment]       TEXT     NOT NULL,
    [CrDate]        DATETIME CONSTRAINT [DF_tblPageComment_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]      INT      NOT NULL,
    [ModeratedDate] DATETIME NULL,
    CONSTRAINT [PK_tblPageComment] PRIMARY KEY CLUSTERED ([CommentID] ASC),
    CONSTRAINT [FK_tblPageComment_tblPage] FOREIGN KEY ([PageID]) REFERENCES [dbo].[tblPage] ([PageID]),
    CONSTRAINT [FK_tblPageComment_tblUser1] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

