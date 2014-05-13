CREATE TABLE [dbo].[tblGameFile] (
    [FileID]      INT           IDENTITY (1, 1) NOT NULL,
    [GameID]      INT           NOT NULL,
    [Title]       VARCHAR (255) NOT NULL,
    [Filename]    VARCHAR (255) NOT NULL,
    [Description] TEXT          NOT NULL,
    [Order]       INT           NOT NULL,
    [Format]      VARCHAR (10)  NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblGameFile_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblGameFile_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblGameFile] PRIMARY KEY CLUSTERED ([FileID] ASC),
    CONSTRAINT [FK_tblGameFile_tblGame] FOREIGN KEY ([GameID]) REFERENCES [dbo].[tblGame] ([GameID])
);

