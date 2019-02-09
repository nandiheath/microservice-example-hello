FROM node:10.15.1-alpine

# Install git and openssh tools
RUN apk apk update && \
        apk upgrade


# Install pm2
RUN npm install -g pm2

# Install app dependencies and cache the node_modules
COPY package.json /tmp/package.json
COPY package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install



# Create app directory
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
RUN mkdir -p /opt/app/logs
WORKDIR /opt/app

# We need the package.json to run scripts
COPY package.json /opt/app/package.json
COPY tsconfig.json /opt/app/tsconfig.json

# Bundle app source
COPY ./src /opt/app/src
COPY ./test /opt/app/test
COPY ./proto /opt/app/proto

# Run test
RUN npm run test


# Build the source
RUN npm run compile
COPY server.config.js /opt/app


CMD [ "pm2-docker", "start" , "server.config.js"]
