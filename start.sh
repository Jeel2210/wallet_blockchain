#!/bin/bash
# Print Hello world message

cd /var/www/html/sym-gym-web-api/
sudo git fetch
sudo git merge origin/staging
sudo pm2 restart 0
