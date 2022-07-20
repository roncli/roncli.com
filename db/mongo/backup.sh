#!/bin/bash

mongodump --gzip --archive=/data/backup/db-$(date +%Y-%m-%d-%H-%M-%S).gz -u web_roncli -p $(cat $WEB_RONCLI_PASSWORD_FILE)

find /data/backup/* -mtime +7 -delete
