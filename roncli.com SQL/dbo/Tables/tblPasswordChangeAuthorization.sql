CREATE TABLE [dbo].[tblPasswordChangeAuthorization] (
    [AuthorizationID]   INT              IDENTITY (1, 1) NOT NULL,
    [UserID]            INT              NOT NULL,
    [AuthorizationCode] UNIQUEIDENTIFIER NOT NULL,
    [ExpirationDate]    DATETIME         NOT NULL,
    [CrDate]            DATETIME         CONSTRAINT [DF_tblPasswordChangeAuthorization_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblPasswordChangeAuthorization] PRIMARY KEY CLUSTERED ([AuthorizationID] ASC),
    CONSTRAINT [FK_tblPasswordChangeAuthorization_tblUser] FOREIGN KEY ([UserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

