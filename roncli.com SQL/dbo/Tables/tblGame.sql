CREATE TABLE [dbo].[tblGame] (
    [GameID]       INT           IDENTITY (1, 1) NOT NULL,
    [Title]        VARCHAR (255) NOT NULL,
    [Description]  TEXT          NOT NULL,
    [IconURL] VARCHAR (1024) NOT NULL,
    [CrDate]       DATETIME      CONSTRAINT [DF_tblGame_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]      DATETIME      CONSTRAINT [DF_tblGame_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblGame] PRIMARY KEY CLUSTERED ([GameID] ASC)
);

