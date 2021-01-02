FROM node:14

# Copy build
COPY ./build/ /usr/src/timetrack
WORKDIR /usr/src/timetrack

# Install Dependencies
COPY ./package*.json ./
RUN npm install

EXPOSE 3000
ENTRYPOINT ./start.sh