CREATE TABLE [dbo].[tblProjectIssueDiscussion] (
    [DiscussionID] INT      IDENTITY (1, 1) NOT NULL,
    [IssueID]      INT      NOT NULL,
    [Text]         TEXT     NOT NULL,
    [CrDate]       DATETIME CONSTRAINT [DF_tblProjectIssueDiscussion_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]     INT      NOT NULL,
    [UpdDate]      DATETIME CONSTRAINT [DF_tblProjectIssueDiscussion_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdUserID]    INT      NOT NULL,
    CONSTRAINT [PK_tblProjectIssueDiscussion] PRIMARY KEY CLUSTERED ([DiscussionID] ASC),
    CONSTRAINT [FK_tblProjectIssueDiscussion_tblProjectIssue] FOREIGN KEY ([IssueID]) REFERENCES [dbo].[tblProjectIssue] ([IssueID]),
    CONSTRAINT [FK_tblProjectIssueDiscussion_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID]),
    CONSTRAINT [FK_tblProjectIssueDiscussion_tblUser1] FOREIGN KEY ([UpdUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

