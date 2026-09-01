#!/bin/bash

# Removing existing env file
> .env

env

# Loop on all environment variables and add them to .env file
env | while IFS='=' read -r varname varvalue; do
    if [ -n "$varname" ]; then
        echo "$varname=\"$varvalue\"" >> .env
    fi
done

# Print content of populated .env file
echo -e "\n--- .env Contents ---"
cat .env

