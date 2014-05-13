CREATE TABLE [dbo].[tblPage] (
    [PageID]       INT           IDENTITY (1, 1) NOT NULL,
    [PageURL]      VARCHAR (255) NOT NULL,
    [ParentPageID] INT           NULL,
    [Order]        INT           NOT NULL,
    [Title]        VARCHAR (255) NOT NULL,
    [ShortTitle]   VARCHAR (255) NULL,
    [PageData]     TEXT          NOT NULL,
    [CrDate]       DATETIME      CONSTRAINT [DF_tblPage_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]      DATETIME      CONSTRAINT [DF_tblPage_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblPage] PRIMARY KEY CLUSTERED ([PageID] ASC),
    CONSTRAINT [FK_tblPage_tblPage_ParentPageID] FOREIGN KEY ([ParentPageID]) REFERENCES [dbo].[tblPage] ([PageID])
);

