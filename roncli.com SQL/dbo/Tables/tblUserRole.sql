CREATE TABLE [dbo].[tblUserRole] (
    [UserRoleID] INT NOT NULL IDENTITY,
    [UserID]     INT NOT NULL,
    [RoleID]     INT NOT NULL,
    CONSTRAINT [PK_tblUserRole] PRIMARY KEY CLUSTERED ([UserRoleID] ASC),
    CONSTRAINT [FK_tblUserRole_tblRole] FOREIGN KEY ([RoleID]) REFERENCES [dbo].[tblRole] ([RoleID]),
    CONSTRAINT [FK_tblUserRole_tblUser] FOREIGN KEY ([UserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

