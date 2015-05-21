CREATE TABLE [dbo].[tblProjectFeature] (
    [FeatureID] INT      NOT NULL IDENTITY,
    [ProjectID] INT      NOT NULL,
    [Order]     INT      NOT NULL,
    [CrDate]    DATETIME CONSTRAINT [DF_tblProjectFeature_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblProjectFeature] PRIMARY KEY CLUSTERED ([FeatureID] ASC),
    CONSTRAINT [FK_tblProjectFeature_tblProject] FOREIGN KEY ([ProjectID]) REFERENCES [dbo].[tblProject] ([ProjectID])
);

