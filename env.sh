#!/bin/bash

# Removing existing env file
rm .env

# saving variables environment prefix in a variable
varprefix="PU_"

# Print relevant environment variables
env | grep -i $varprefix

# Recreate config file and assignment

# Loop on environment variables prefixed with
# PU_ and add them to .env file
for var in $(env | grep "$varprefix"); do
    varname=$(printf '%s\n' "${var#$varprefix}" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$var" | sed -e 's/^[^=]*=//')

    echo "$varname=\"$varvalue\"" >> .env
done

