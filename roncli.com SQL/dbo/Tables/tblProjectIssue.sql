CREATE TABLE [dbo].[tblProjectIssue] (
    [IssueID]        INT           IDENTITY (1, 1) NOT NULL,
    [ProjectID]      INT           NOT NULL,
    [Title]          VARCHAR (255) NOT NULL,
    [Description]    TEXT          NOT NULL,
    [Status]         VARCHAR (10)  NOT NULL,
    [AssigneeUserID] INT           NULL,
    [CrDate]         DATETIME      CONSTRAINT [DF_tblProjectIssue_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]       INT           NOT NULL,
    [UpdDate]        DATETIME      CONSTRAINT [DF_tblProjectIssue_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdUserID]      INT           NOT NULL,
    CONSTRAINT [PK_tblProjectIssue] PRIMARY KEY CLUSTERED ([IssueID] ASC),
    CONSTRAINT [FK_tblProjectIssue_tblProject] FOREIGN KEY ([ProjectID]) REFERENCES [dbo].[tblProject] ([ProjectID]),
    CONSTRAINT [FK_tblProjectIssue_tblUser] FOREIGN KEY ([AssigneeUserID]) REFERENCES [dbo].[tblUser] ([UserID]),
    CONSTRAINT [FK_tblProjectIssue_tblUser1] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID]),
    CONSTRAINT [FK_tblProjectIssue_tblUser2] FOREIGN KEY ([UpdUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

