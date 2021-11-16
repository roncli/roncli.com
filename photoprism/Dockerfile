# Get PhotoPrism latest.
FROM photoprism/photoprism:latest

# Create /var/photoprism directory.
RUN mkdir -p /var/photoprism

# Install packages.
RUN apt-get update && apt-get -y install cifs-utils && apt-get -y install keyutils

# Copy files into /var/www directory.
WORKDIR /var/photoprism
COPY . .

# Make needed directories.
RUN mkdir -p /photoprism/originals
RUN mkdir -p /photoprism/storage

# Import arg.
ARG USE_AZURE_FILE_STORAGE

# Replace library with link if we're going to use Azure file storage.
RUN if [ $USE_AZURE_FILE_STORAGE -eq 1 ]; then rm -r /photoprism/originals; mkdir -p /mnt/library; ln -s /mnt/library /photoprism/originals; fi

# Allow start script to run.
RUN chmod +x /var/photoprism/*.sh

# Expose port 2342.
EXPOSE 2342
