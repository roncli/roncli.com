#!/bin/sh

# Run app.
exec env PHOTOPRISM_DATABASE_PASSWORD=$(cat $PHOTOPRISM_DATABASE_PASSWORD_FILE) /scripts/entrypoint.sh photoprism start
