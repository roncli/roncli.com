#!/bin/sh

mongosh --eval "const WEB_RONCLI_PASSWORD = '$(cat $WEB_RONCLI_PASSWORD_FILE)';" 127.0.0.1:27017 /var/mongo/init.js
mongosh 127.0.0.1:27017 /var/mongo/migrations/index.js
touch /data/db/initialized
