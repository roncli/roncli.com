CREATE TABLE [dbo].[tblProjectDownloadFile] (
    [FileID]      INT           IDENTITY (1, 1) NOT NULL,
    [DownloadID]  INT           NOT NULL,
    [Title]       VARCHAR (255) NOT NULL,
    [Description] TEXT          NOT NULL,
    [Filename]    VARCHAR (255) NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblProjectDownloadFile_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [CrUserID]    INT           NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblProjectDownloadFile_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDateID]   INT           NOT NULL,
    CONSTRAINT [PK_tblProjectDownloadFile] PRIMARY KEY CLUSTERED ([FileID] ASC),
    CONSTRAINT [FK_tblProjectDownloadFile_tblProjectDownload] FOREIGN KEY ([DownloadID]) REFERENCES [dbo].[tblProjectDownload] ([DownloadID]),
    CONSTRAINT [FK_tblProjectDownloadFile_tblUser] FOREIGN KEY ([CrUserID]) REFERENCES [dbo].[tblUser] ([UserID]),
    CONSTRAINT [FK_tblProjectDownloadFile_tblUser1] FOREIGN KEY ([UpdDateID]) REFERENCES [dbo].[tblUser] ([UserID])
);

