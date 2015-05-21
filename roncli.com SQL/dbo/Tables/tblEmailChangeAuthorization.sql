CREATE TABLE [dbo].[tblEmailChangeAuthorization] (
    [AuthorizationID]   INT              NOT NULL IDENTITY,
    [UserID]            INT              NOT NULL,
    [AuthorizationCode] UNIQUEIDENTIFIER NOT NULL,
    [ExpirationDate]    DATETIME         NOT NULL,
    [CrDate]            DATETIME         CONSTRAINT [DF_tblEmailChangeAuthorization_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblEmailChangeAuthorization] PRIMARY KEY CLUSTERED ([AuthorizationID] ASC),
    CONSTRAINT [FK_tblEmailChangeAuthorization_tblUser] FOREIGN KEY ([UserID]) REFERENCES [dbo].[tblUser] ([UserID])
);

