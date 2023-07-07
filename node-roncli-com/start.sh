#!/bin/sh

# Validation.
if [ ! $APPINSIGHTS_INSTRUMENTATIONKEY ];
then
    echo "Warning: Application Insights is not setup.  Application will log to console."
fi

# Run app.
exec env APPINSIGHTS_INSTRUMENTATIONKEY=$(cat $APPINSIGHTS_INSTRUMENTATIONKEY) env BLIZZARD_CLIENT_ID=$(cat $BLIZZARD_CLIENT_ID_FILE) env BLIZZARD_CLIENT_SECRET=$(cat $BLIZZARD_CLIENT_SECRET_FILE) env COOKIE_SECRET=$(cat $COOKIE_SECRET_FILE) env DISCORD_TOKEN=$(cat $DISCORD_TOKEN_FILE) env ENCRYPTION_KEY=$(cat $ENCRYPTION_KEY_FILE) env GITHUB_TOKEN=$(cat $GITHUB_TOKEN_FILE) env GOOGLE_API_KEY=$(cat $GOOGLE_API_KEY_FILE) env REDIS_PASSWORD=$(cat $REDIS_PASSWORD_FILE) env SMTP_PASSWORD=$(cat $SMTP_PASSWORD_FILE) env SOUNDCLOUD_CLIENT_ID=$(cat $SOUNDCLOUD_CLIENT_ID_FILE) env SOUNDCLOUD_CLIENT_SECRET=$(cat $SOUNDCLOUD_CLIENT_SECRET_FILE) env STEAM_API_KEY=$(cat $STEAM_API_KEY_FILE) env TUMBLR_CONSUMER_KEY=$(cat $TUMBLR_CONSUMER_KEY_FILE) env TUMBLR_CONSUMER_SECRET=$(cat $TUMBLR_CONSUMER_SECRET_FILE) env TWITCH_CLIENTID=$(cat $TWITCH_CLIENTID_FILE) env TWITCH_CLIENTSECRET=$(cat $TWITCH_CLIENTSECRET_FILE) env WEB_RONCLI_PASSWORD=$(cat $WEB_RONCLI_PASSWORD_FILE) env XIVAPI_API_KEY=$(cat $XIVAPI_API_KEY_FILE) node index
