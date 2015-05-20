CREATE TABLE [dbo].[tblRedirectHit] (
    [HitID]         BIGINT        IDENTITY (1, 1) NOT NULL,
    [RedirectID]    INT           NOT NULL,
    [IP]            VARCHAR (8)   NOT NULL,
    [Referrer]      VARCHAR (256) NULL,
    [UserAgent]     VARCHAR (256) NULL,
    [CrDate]        DATETIME      CONSTRAINT [DF_tblRedirectHit_CrDate] DEFAULT (getutcdate()) NOT NULL
    CONSTRAINT [PK_tblRedirectHit] PRIMARY KEY ([HitID] ASC),
    INDEX [IX_tblRedirectHit_RedirectID] ([RedirectID] ASC),
    CONSTRAINT [FK_tblRedirectHit_tblRedirectID] FOREIGN KEY ([RedirectID]) REFERENCES [dbo].[tblRedirect] ([RedirectID])
);

