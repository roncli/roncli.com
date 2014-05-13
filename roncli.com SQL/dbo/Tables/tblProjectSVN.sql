CREATE TABLE [dbo].[tblProjectSVN] (
    [SVNID]       INT           IDENTITY (1, 1) NOT NULL,
    [ProjectID]   INT           NOT NULL,
    [Path]        VARCHAR (255) NOT NULL,
    [Description] TEXT          NOT NULL,
    [Order]       INT           NOT NULL,
    [CrDate]      DATETIME      CONSTRAINT [DF_tblProjectSVN_CrDate] DEFAULT (getutcdate()) NOT NULL,
    [UpdDate]     DATETIME      CONSTRAINT [DF_tblProjectSVN_UpdDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_tblProjectSVN] PRIMARY KEY CLUSTERED ([SVNID] ASC),
    CONSTRAINT [FK_tblProjectSVN_tblProject] FOREIGN KEY ([ProjectID]) REFERENCES [dbo].[tblProject] ([ProjectID])
);

