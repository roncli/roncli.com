CREATE TABLE [dbo].[tblUser] (
    [UserID]         INT              IDENTITY (1, 1) NOT NULL,
    [Email]          VARCHAR (256)    NOT NULL,
    [DOB]            DATETIME         NOT NULL,
    [Alias]          VARCHAR (20)     NOT NULL,
    [Salt]           UNIQUEIDENTIFIER NOT NULL,
    [PasswordHash]   VARCHAR (256)    NOT NULL,
    [Validated]      BIT              NOT NULL,
    [ValidationCode] UNIQUEIDENTIFIER NOT NULL,
    [ValidationDate] DATETIME         NULL,
    [CrDate]         DATETIME         CONSTRAINT [DF_tblUser_CrDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblUser] PRIMARY KEY CLUSTERED ([UserID] ASC)
);

