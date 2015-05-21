CREATE TABLE [dbo].[tblRole] (
    [RoleID] INT         NOT NULL IDENTITY,
    [Role]   VARCHAR(20) NOT NULL,
    [CrDate] DATETIME    CONSTRAINT [DF_tblRole_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblRole] PRIMARY KEY CLUSTERED ([RoleID] ASC)
);

