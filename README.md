# microservice-example-hello

This project is a demo for running a gRPC server that serve a ```Hello``` request and return the username if the bearer token issued with JWT is presented.

## Concept

In this project we will authenicate the user by examinate the ```Authorization``` header supplied to gRPC metadata. The user should have a signed JWT token with the SECRET provided in enviroment variable. Otherwise unauthenicated error is returned from gRPC.

Example for the client:

```javascript
// Provide the authorization header as metadata
const metadata:grpc.Metadata = new grpc.Metadata();
      metadata.add('Authorization', `Bearer ${token}`);
client.Hello({}, metadata, (err, data) => {
  if (err) {
    // error handling
  }
  const {
    message
  } = data;
  // `Hello ${username}`
  ...
});

```

The project is written in typescript and can be transpiled to javascript using ```tsc``` and the config file ```tsconfig.json```

## Setup for development

```javascript
# install dependencies
npm install

# modify the envirnment variables
mv .env-sample .env

# !! REMEMBER TO UPDATE THE JWT_SECRET

# use nodemon to monitor code changes and compile from typescript
npm run dev

# The server will listen to 127.0.0.1:6020 as default
```

### Logging Strategy

In this sample we use winston as the logger.
Depends on the need, user can change to use console logger or even log rotation by simply modifying the ```./src/utils/logger.ts```

## Running in docker

### Building the docker image

```sh
docker build .
```

Be noticed that if any of the test failed, the build process will be terminated.

### Environment Variables

To run in docker, enviroment variables should be provided otherwise default values will be used
Enviroment variables are listed in ```.env-sample```

### Exceptions

The dockerized image is running with [pm2-docker](http://pm2.keymetrics.io/) , which will monitor the process and restart if process failed.
The settings such as restart count are stored inside ```server.config.js```


## TODOs

- JWT_SECRET
  - should be supplied with more secure way e.g. secrete for kubenetes
- gitsubmodules
  - some common files should be extracted to a seperate git repo as submodules. e.g. ```./proto``` or ```./src/utils```
