import * as grpc from 'grpc';

import { SERVER_HOST, SERVER_PORT } from './common/env'
import logger from './utils/logger';

import { route } from './route';



const server:grpc.Server = new grpc.Server();
// Add the routes

logger.info(`Server running at ${SERVER_HOST}:${SERVER_PORT}`);
server.bind(`${SERVER_HOST}:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure());
route(server);

server.start();

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received.');
  shutdown();
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received.');
  shutdown();
});

const shutdown = () => {
  server.tryShutdown(() => {
    logger.info('gRPC server shutdown completely');
    process.exit(1);
  })

}

export default server;