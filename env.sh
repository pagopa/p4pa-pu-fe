#!/bin/bash

# Removing existing env file
> .env

if [ -z "${ENV:-}" ]; then
    echo "ENV is required (e.g. ENV=DEV)" >&2
    exit 1
fi

prefix="${ENV}_VITE_"

# Always keep ENV in the generated .env file
echo "ENV=\"${ENV}\"" >> .env

# Keep only variables named <ENV>_VITE_...
env | while IFS='=' read -r varname varvalue; do
    if [ -n "$varname" ] && [[ "$varname" == "${prefix}"* ]]; then
        echo "${varname}=\"${varvalue}\"" >> .env
    fi
done

# Print content of populated .env file
echo -e "\n--- .env Contents ---"
cat .env

