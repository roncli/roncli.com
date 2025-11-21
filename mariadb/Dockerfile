# Get MariaDB.
FROM mariadb:12.1.2

# Create /var/mariadb directory.
RUN mkdir -p /var/mariadb

# Copy files into /var/www directory.
WORKDIR /var/mariadb
COPY . .

# Allow start script to run.
RUN chmod +x /var/mariadb/*.sh

# Expose port 3306.
EXPOSE 3306
