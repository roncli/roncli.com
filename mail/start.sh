#!/bin/sh

# Link to the Let's Encrypt certs.
if [ ! -f /etc/postfix/cert/smtp.cert ]
then
    ln -s /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/postfix/cert/smtp.cert
fi

if [ ! -f /etc/postfix/cert/smtp.key ]
then
    ln -s /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/postfix/cert/smtp.key
fi

/entrypoint.sh
