# Get mongo latest.
FROM mongo:7.0.14

# Create /docker-entrypoint-initdb.d directory.
RUN mkdir -p /docker-entrypoint-initdb.d

# Create /var/mongo directory.
RUN mkdir -p /var/mongo

# Copy files.
COPY ./init/ /docker-entrypoint-initdb.d/
COPY ./mongo/ /var/mongo/

# Allow scripts to run.
RUN chmod +x /docker-entrypoint-initdb.d/*.sh
RUN chmod +x /var/mongo/*.sh

# Expose port 27017.
EXPOSE 27017
