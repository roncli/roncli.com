CREATE TABLE [dbo].[tblDCLPlaylist] (
    [PlaylistID] VARCHAR(64) NOT NULL,
    [SeasonEndDate] DATETIME NOT NULL, 
    CONSTRAINT [PK_tblDCLPlaylist] PRIMARY KEY CLUSTERED ([PlaylistID] ASC),
);

