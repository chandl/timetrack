#!/usr/bin/env bash
echo "*** Cleaning Current Builds"
rm -rf build server/build client/build
mkdir -p build/public

echo "*** Building Server"
cd server && npm run build && cp -R build/* ../build

echo "*** Building Client"
cd ../client && npm run build && cp -R build/* ../build/public
cd ..

echo "*** Building Docker Image"
docker build -t timetrack:latest .

echo "*** Pushing Docker Image"