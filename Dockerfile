FROM node:14

# Copy build
COPY ./build/ /usr/src/timetrack
WORKDIR /usr/src/timetrack

# Install Dependencies
COPY ./server/package*.json ./
RUN npm install

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s \
    CMD curl -f http://localhost:3000/metrics || exit 1

ENTRYPOINT ./start.sh