CREATE TABLE [dbo].[tblRedirect] (
    [RedirectID] INT           NOT NULL IDENTITY,
    [FromPath]   VARCHAR(255)  NOT NULL,
    [ToURL]      VARCHAR(1024) NOT NULL,
    [CrDate]     DATETIME      CONSTRAINT [DF_tblRedirect_CrDate] DEFAULT (getutcdate()) NOT NULL
    CONSTRAINT [PK_tblRedirect] PRIMARY KEY CLUSTERED ([RedirectID] ASC)
);

