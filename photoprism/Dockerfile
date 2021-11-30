# Get PhotoPrism latest.
FROM photoprism/photoprism:latest

# Create /var/photoprism directory.
RUN mkdir -p /var/photoprism

# Install packages.
RUN apt-get update && apt-get -y install cifs-utils && apt-get -y install keyutils

# Copy files into /var/www directory.
WORKDIR /var/photoprism
COPY . .

# Allow start script to run.
RUN chmod +x /var/photoprism/*.sh

# Expose port 2342.
EXPOSE 2342
