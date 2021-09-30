#!/bin/sh

# Validation.
if [ ! $DOMAIN ];
then
    echo "Error: You must include a domain.  Please set the DOMAIN environment variable to the domain you are trying to get a certificate for.  For multiple domains, separate each domain with commas." >&2
    exit 1
fi

if [ ! $EMAIL ];
then
    echo "Error: You must include an email address, this script will not support --register-unsafely-without-email.  Please set the EMAIL environment variable to the email contact associated with this domain." >&2
    exit 2
fi

for ENTRY in ${DOMAIN//,/ }
do
    if [[ ! -f "/etc/letsencrypt/live/$ENTRY/fullchain.pem" ]];
    then
        echo "Warning: nginx isn't ready to receive certs yet.  This may be due to the nginx container not yet being setup, if this error continues please check to see if the nginx container is running." >&2
        exit 3
    fi

    # Make directories if they don't yet exist.
    mkdir -p /var/certbot/work
    mkdir -p /var/certbot/work/$ENTRY

    # Run certbot if certificates don't yet exist.
    if [[ ! -f /var/certbot/work/.init ]];
    then
        echo "Running certbot to initialize certificates."

        # Enable staging mode if needed.
        if [ $STAGING ];
        then
            stagingArg="--staging"
        fi

        # Create required directories.
        mkdir -p "/var/certbot/work/$ENTRY/.well-known"

        # Remove directories needed by certbot.
        rm -Rf /etc/letsencrypt/live/$ENTRY
        rm -Rf /etc/letsencrypt/archive/$ENTRY
        rm -Rf /etc/letsencrypt/renewal/$ENTRY.conf    

        # Get the certificate.
        certbot certonly -n --webroot -w /var/certbot/work/$ENTRY/.well-known $stagingArg --email $EMAIL -d $ENTRY --rsa-key-size 4096 --agree-tos --force-renewal

        # Create .init file to indicate the certificates now exist.
        touch /var/certbot/work/.init
    fi
done

# Renew every 12 hours.
while :
do
    echo "Checking for renewal."
    certbot renew -n
    sleep 12h
done
