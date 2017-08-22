#!/usr/bin/env bash

cd $( dirname "${BASH_SOURCE[0]}" )

node fetch-service-data.js

echo "Done!"
