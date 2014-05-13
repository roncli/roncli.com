CREATE TABLE [dbo].[tblProject] (
    [ProjectID]   INT           IDENTITY (1, 1) NOT NULL,
    [Title]       VARCHAR (255) NOT NULL,
    [URL]         VARCHAR (255) NULL,
    [Description] TEXT          NOT NULL,
    [LicenseID]   INT           NOT NULL,
    [Public]      BIT           NOT NULL,
    [CrDate]      DATETIME      NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblProject_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblProject] PRIMARY KEY CLUSTERED ([ProjectID] ASC),
    CONSTRAINT [FK_tblProject_tblLicense] FOREIGN KEY ([LicenseID]) REFERENCES [dbo].[tblLicense] ([LicenseID])
);

