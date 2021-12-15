#!/bin/sh

# Run app.
PHOTOPRISM_DATABASE_PASSWORD=$(cat $PHOTOPRISM_DATABASE_PASSWORD_FILE) /entrypoint.sh photoprism start
