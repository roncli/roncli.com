#!/bin/sh

# Run app.
PHOTOPRISM_LOG_LEVEL=error PHOTOPRISM_PUBLIC=true PHOTOPRISM_SITE_URL=https://photos.roncli.com/ PHOTOPRISM_DOWNLOAD_TOKEN=public PHOTOPRISM_SITE_AUTHOR="Ronald M. Clifford" PHOTOPRISM_SITE_TITLE="roncli.com Photos" PHOTOPRISM_SITE_CAPTION="Music. Coding. Gaming. Life." /entrypoint.sh photoprism start
