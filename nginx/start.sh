#!/bin/sh

# Create password file if it doesn't yet exist.
if [ ! -f /var/nginx/.htpasswd ];
then
    echo "Creating password file for photos..."
    echo "$(cat $PHOTOS_PASSWORD_FILE)" | htpasswd -c -i /var/nginx/.htpasswd $(cat $PHOTOS_USERNAME_FILE)
fi

# Make directories if they don't yet exist.
mkdir -p /etc/letsencrypt
mkdir -p /var/certbot/work
mkdir -p /var/nginx/work/roncli-com
mkdir -p /var/nginx/work/photos-roncli-com
mkdir -p /var/nginx/work/ronc-li

# Default proxy port to 3030.
if [ ! $PROXY_PORT ];
then
    PROXY_PORT=3030
fi

# Copy the nginx config.
cp /var/nginx/conf/nginx.conf /etc/nginx/nginx.conf

# Create the well-known dir.
mkdir -p /var/certbot/work/roncli.com/.well-known
mkdir -p /var/certbot/work/photos.roncli.com/.well-known
mkdir -p /var/certbot/work/ronc.li/.well-known

# Create options-ssl-nginx.conf if it doesn't exist.
if [ ! -f /var/nginx/work/options-ssl-nginx.conf ];
then
    echo "Creating options-ssl-nginx.conf..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > /var/nginx/work/options-ssl-nginx.conf
    cp /var/nginx/work/options-ssl-nginx.conf /etc/letsencrypt/options-ssl-nginx.conf
fi

# Create ssl-dhparams.pem if it doesn't exist.
if [ ! -f /var/nginx/work/ssl-dhparams.pem ];
then
    echo "Creating ssl-dhparams.pem..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > /var/nginx/work/ssl-dhparams.pem
    cp /var/nginx/work/ssl-dhparams.pem /etc/letsencrypt/ssl-dhparams.pem
fi

# Create dummy certifications if they don't exist.
if [ ! -f /var/nginx/work/roncli-com/fullchain.pem ];
then
    echo "Creating dummy certifications..."
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 -keyout /var/nginx/work/roncli-com/privkey.pem -out /var/nginx/work/roncli-com/fullchain.pem -subj /CN=localhost
    mkdir -p "/etc/letsencrypt/live/roncli.com"
    cp /var/nginx/work/roncli-com/privkey.pem "/etc/letsencrypt/live/roncli.com/privkey.pem"
    cp /var/nginx/work/roncli-com/fullchain.pem "/etc/letsencrypt/live/roncli.com/fullchain.pem"
fi

if [ ! -f /var/nginx/work/photos-roncli-com/fullchain.pem ];
then
    echo "Creating dummy certifications..."
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 -keyout /var/nginx/work/photos-roncli-com/privkey.pem -out /var/nginx/work/photos-roncli-com/fullchain.pem -subj /CN=localhost
    mkdir -p "/etc/letsencrypt/live/photos.roncli.com"
    cp /var/nginx/work/photos-roncli-com/privkey.pem "/etc/letsencrypt/live/photos.roncli.com/privkey.pem"
    cp /var/nginx/work/photos-roncli-com/fullchain.pem "/etc/letsencrypt/live/photos.roncli.com/fullchain.pem"
fi

if [ ! -f /var/nginx/work/ronc-li/fullchain.pem ];
then
    echo "Creating dummy certifications..."
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 -keyout /var/nginx/work/ronc-li/privkey.pem -out /var/nginx/work/ronc-li/fullchain.pem -subj /CN=localhost
    mkdir -p "/etc/letsencrypt/live/ronc.li"
    cp /var/nginx/work/ronc-li/privkey.pem "/etc/letsencrypt/live/ronc.li/privkey.pem"
    cp /var/nginx/work/ronc-li/fullchain.pem "/etc/letsencrypt/live/ronc.li/fullchain.pem"
fi

# Reload nginx every 15 days to pick up any cert changes.
$(while true; do sleep 15d; nginx -s reload; done) &

echo "Starting..."

# Start nginx.
exec nginx -g "daemon off;"
