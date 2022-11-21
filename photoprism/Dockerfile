# Get PhotoPrism latest.
FROM photoprism/photoprism:221118-jammy

# Create /var/photoprism directory.
RUN mkdir -p /var/photoprism

# Copy files into /var/www directory.
WORKDIR /var/photoprism
COPY . .

# Allow start script to run.
RUN chmod +x /var/photoprism/*.sh

# Expose port 2342.
EXPOSE 2342
