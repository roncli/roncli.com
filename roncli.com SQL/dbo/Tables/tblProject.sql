﻿CREATE TABLE [dbo].[tblProject] (
    [ProjectID]   INT           NOT NULL IDENTITY,
    [Title]       VARCHAR(255)  NOT NULL,
    [URL]         VARCHAR(1024) NOT NULL,
    [ProjectURL]  VARCHAR(1024) NULL,
    [User]        VARCHAR(50)   NULL,
    [Repository]  VARCHAR(50)   NULL,
    [Description] TEXT          NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblProject_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblProject_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblProject] PRIMARY KEY CLUSTERED ([ProjectID] ASC)
);

