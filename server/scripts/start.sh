#!/bin/bash

export DIR=$(pwd)
export PORT=3000
export TZ=UTC
export TYPEORM_CONNECTION=mariadb
export TYPEORM_SYNCHRONIZE=true
export TYPEORM_LOGGING=false
export TYPEORM_ENTITIES=entity/*.js

echo "========== STARTING TIMETRACK SERVER -- ENVIRONMENT =========="
env
echo "===================="

node index.js