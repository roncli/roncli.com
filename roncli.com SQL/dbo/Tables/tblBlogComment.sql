CREATE TABLE [dbo].[tblBlogComment] (
    [CommentID]     INT           NOT NULL IDENTITY,
    [BlogURL]       VARCHAR(1024) NOT NULL,
    [Comment]       TEXT          NOT NULL,
    [CrDate]        DATETIME      CONSTRAINT [DF_tblBlogComment_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]      INT           NOT NULL,
    [ModeratedDate] DATETIME      NULL,
    CONSTRAINT [PK_tblBlogComment] PRIMARY KEY CLUSTERED ([CommentID] ASC),
    CONSTRAINT [FK_tblBlogComment_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

