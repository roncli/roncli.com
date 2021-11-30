#!/bin/sh

if [ $USE_AZURE_FILE_STORAGE -eq 1 ];
then
    # Mount Azure Storage file shares.
    mount -t cifs $(cat $LIBRARY_URI) /photoprism/originals -o vers=3.0,username=$(cat $LIBRARY_USERNAME),password=$(cat $LIBRARY_PASSWORD),dir_mode=0755,file_mode=0755,serverino
    mount -t cifs $(cat $STORAGE_URI) /photoprism/storage -o vers=3.0,username=$(cat $STORAGE_USERNAME),password=$(cat $STORAGE_PASSWORD),dir_mode=0755,file_mode=0755,serverino
fi

# Run app.
PHOTOPRISM_LOG_LEVEL=error PHOTOPRISM_PUBLIC=true PHOTOPRISM_SITE_URL=https://photos.roncli.com/ PHOTOPRISM_DOWNLOAD_TOKEN=public PHOTOPRISM_SITE_AUTHOR="Ronald M. Clifford" PHOTOPRISM_SITE_TITLE="roncli.com Photos" PHOTOPRISM_SITE_CAPTION="Music. Coding. Gaming. Life." /entrypoint.sh photoprism start
