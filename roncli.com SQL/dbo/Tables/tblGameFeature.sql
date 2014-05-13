CREATE TABLE [dbo].[tblGameFeature] (
    [FeatureID] INT      IDENTITY (1, 1) NOT NULL,
    [GameID]    INT      NOT NULL,
    [Order]     INT      NOT NULL,
    [CrDate]    DATETIME CONSTRAINT [DF_tblGameFeature_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblGameFeature] PRIMARY KEY CLUSTERED ([FeatureID] ASC),
    CONSTRAINT [FK_tblGameFeature_tblGame] FOREIGN KEY ([GameID]) REFERENCES [dbo].[tblGame] ([GameID])
);

