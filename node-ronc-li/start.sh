#!/bin/sh

# Validation.
if [ ! $APPINSIGHTS_INSTRUMENTATIONKEY ];
then
    echo "Warning: Application Insights is not setup.  Application will log to console."
fi

# Run app.
exec env APPINSIGHTS_INSTRUMENTATIONKEY=$(cat $APPINSIGHTS_INSTRUMENTATIONKEY) env WEB_RONCLI_PASSWORD=$(cat $WEB_RONCLI_PASSWORD_FILE) node index
