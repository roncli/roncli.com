# Get Node LTS Alpine.
FROM node:lts-alpine

# Create /var/www directory.
RUN mkdir -p /var/www

# Copy package.json into /var/www directory.
WORKDIR /var/www
COPY ./package.json .

# Run NPM install.
RUN apk update && apk add git
RUN npm install --production --silent
RUN apk del git

# Copy remaining files.
COPY . .

# Import arg.
ARG USE_AZURE_FILE_STORAGE

# Remove test files directory if we're going to use Azure file storage.
RUN if [ $USE_AZURE_FILE_STORAGE -eq 1 ]; then rm -r ./files; mkdir -p /mnt/files; ln -s /mnt/files ./files; fi

# Allow start script to run.
RUN chmod +x /var/www/*.sh

# Expose port 3031.
EXPOSE 3030
