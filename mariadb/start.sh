#!/bin/sh

# Run app.
/usr/local/bin/docker-entrypoint.sh mysqld --innodb-buffer-pool-size=256M --transaction-isolation=READ-COMMITTED --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --max-connections=512 --innodb-rollback-on-timeout=OFF --innodb-lock-wait-timeout=120 --user=mysql
