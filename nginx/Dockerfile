# Get nginx stable Alpine.
FROM nginx:stable-alpine

# Get packages.
RUN apk update && apk add openssl

# Create /var/nginx directory.
RUN mkdir -p /var/nginx/work

# Copy scripts.
COPY ./*.sh /var/nginx/
COPY ./conf/*.conf /var/nginx/conf/

# Allow start script to run.
RUN chmod +x /var/nginx/*.sh

# Expose ports 80 and 443.
EXPOSE 80 443
