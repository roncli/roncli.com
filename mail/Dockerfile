# Get simple-mail-forwarder
FROM zixia/simple-mail-forwarder:latest

# Create /etc/postfix/cert directory.
RUN mkdir -p /etc/postfix/cert

# Create /var/mail directory.
RUN mkdir -p /var/mail

# Copy scripts.
COPY ./*.sh /var/mail/

# Allow start script to run.
RUN chmod +x /var/mail/*.sh
