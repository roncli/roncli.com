CREATE TABLE [dbo].[tblLicense] (
    [LicenseID]   INT           IDENTITY (1, 1) NOT NULL,
    [Title]       VARCHAR (255) NOT NULL,
    [URL]         VARCHAR (255) NOT NULL,
    [Description] TEXT          NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblLicense_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblLicense_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblLicense] PRIMARY KEY CLUSTERED ([LicenseID] ASC)
);

