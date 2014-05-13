CREATE TABLE [dbo].[tblGameURL] (
    [URLID]       INT           IDENTITY (1, 1) NOT NULL,
    [GameID]      INT           NOT NULL,
    [Title]       VARCHAR (255) NOT NULL,
    [URL]         VARCHAR (255) NOT NULL,
    [Description] TEXT          NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblGameURL_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblGameURL_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblGameURL] PRIMARY KEY CLUSTERED ([URLID] ASC),
    CONSTRAINT [FK_tblGameURL_tblGame] FOREIGN KEY ([GameID]) REFERENCES [dbo].[tblGame] ([GameID])
);

