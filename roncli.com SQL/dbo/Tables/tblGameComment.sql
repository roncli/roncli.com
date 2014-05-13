CREATE TABLE [dbo].[tblGameComment] (
    [CommentID]     INT      IDENTITY (1, 1) NOT NULL,
    [GameID]        INT      NOT NULL,
    [Comment]       TEXT     NOT NULL,
    [CrDate]        DATETIME CONSTRAINT [DF_tblGameComment_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]      INT      NOT NULL,
    [ModeratedDate] DATETIME NULL,
    CONSTRAINT [PK_tblGameComment] PRIMARY KEY CLUSTERED ([CommentID] ASC),
    CONSTRAINT [FK_tblGameComment_tblGame] FOREIGN KEY ([GameID]) REFERENCES [dbo].[tblGame] ([GameID]),
    CONSTRAINT [FK_tblGameComment_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

