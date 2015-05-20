CREATE TABLE [dbo].[tblRedirectHit] (
    [HitID]         BIGINT        IDENTITY (1, 1) NOT NULL,
    [RedirectID]    INT           NOT NULL,
    [IP]            VARCHAR (15)  NOT NULL,
    [Referrer]      VARCHAR (256) NULL,
    [UserAgent]     VARCHAR (256) NULL,
    [CrDate]        DATETIME      CONSTRAINT [DF_tblRedirectHit_CrDate] DEFAULT (getutcdate()) NOT NULL
    CONSTRAINT [PK_tblRedirectHit] PRIMARY KEY NONCLUSTERED ([HitID] ASC),
    INDEX [IX_tblRedirectHit_RedirectID] CLUSTERED ([RedirectID] ASC),
    CONSTRAINT [FK_tblRedirectHit_tblRedirectID] FOREIGN KEY ([RedirectID]) REFERENCES [dbo].[tblRedirect] ([RedirectID])
);

