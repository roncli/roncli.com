CREATE TABLE [dbo].[tblRole] (
    [RoleID] INT          IDENTITY (1, 1) NOT NULL,
    [Role]   VARCHAR (20) NOT NULL,
    [CrDate] DATETIME     CONSTRAINT [DF_tblRole_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblRole] PRIMARY KEY CLUSTERED ([RoleID] ASC)
);

