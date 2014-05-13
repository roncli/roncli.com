CREATE TABLE [dbo].[tblProjectDownload] (
    [DownloadID]  INT           IDENTITY (1, 1) NOT NULL,
    [ProjectID]   INT           NOT NULL,
    [Title]       VARCHAR (255) NOT NULL,
    [Description] TEXT          NOT NULL,
    [Visible]     BIT           NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblProjectDownload_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]    INT           NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblProjectDownload_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdUserID]   INT           NOT NULL,
    CONSTRAINT [PK_tblProjectDownload] PRIMARY KEY CLUSTERED ([DownloadID] ASC),
    CONSTRAINT [FK_tblProjectDownload_tblProject] FOREIGN KEY ([ProjectID]) REFERENCES [dbo].[tblProject] ([ProjectID]),
    CONSTRAINT [FK_tblProjectDownload_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID]),
    CONSTRAINT [FK_tblProjectDownload_tblUser1] FOREIGN KEY ([UpdUserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

