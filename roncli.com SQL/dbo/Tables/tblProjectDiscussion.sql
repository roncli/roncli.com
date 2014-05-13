CREATE TABLE [dbo].[tblProjectDiscussion] (
    [DiscussionID] INT      IDENTITY (1, 1) NOT NULL,
    [ProjectID]    INT      NOT NULL,
    [Text]         TEXT     NOT NULL,
    [CrDate]       DATETIME CONSTRAINT [DF_tblProjectDiscussion_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]     INT      NOT NULL,
    [UpdDate]      DATETIME CONSTRAINT [DF_tblProjectDiscussion_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdUserID]    INT      NOT NULL,
    CONSTRAINT [PK_tblProjectDiscussion] PRIMARY KEY CLUSTERED ([DiscussionID] ASC),
    CONSTRAINT [FK_tblProjectDiscussion_tblProject] FOREIGN KEY ([ProjectID]) REFERENCES [dbo].[tblProject] ([ProjectID]),
    CONSTRAINT [FK_tblProjectDiscussion_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID]),
    CONSTRAINT [FK_tblProjectDiscussion_tblUser1] FOREIGN KEY ([UpdUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

