#!/usr/bin/env bash
echo "*** Cleaning Current Builds"
rm -rf build server/build client/build
mkdir -p build/public

echo "*** Building Server"
cd server && npm run build && cp -R build/* ../build

echo "*** Building Client"
cd ../client && npm run build && cp -R build/* ../build/public
cd ..


REGISTRY="registry.lan.chandl.io:5000"
if curl --output /dev/null --silent --head --fail "https://$REGISTRY"; then
    echo "*** Building and Pushing Multi-Arch Docker Image"

    docker buildx create --name mybuilder
    docker buildx use mybuilder
    docker buildx build --platform linux/amd64,linux/arm64 --push -t $REGISTRY/timetrack:latest .
    # docker push registry.lan.chandl.io:5000/timetrack:latest
else
    echo "*** Local Docker Registry Not Resolvable. Building local image"

    docker build -t timetrack:latest .

fi