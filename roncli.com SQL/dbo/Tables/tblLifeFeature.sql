CREATE TABLE [dbo].[tblLifeFeature] (
    [FeatureID] INT NOT NULL IDENTITY,
    [PageID]    INT NOT NULL,
    [Order]     INT NOT NULL,
    [CrDate]    DATETIME CONSTRAINT [DF_tblLifeFeature_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblLifeFeature] PRIMARY KEY CLUSTERED ([FeatureID] ASC),
    CONSTRAINT [FK_tblLifeFeature_tblPage] FOREIGN KEY ([PageID]) REFERENCES [dbo].[tblPage] ([PageID])
);

