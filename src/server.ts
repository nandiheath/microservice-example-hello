import * as grpc from 'grpc';

import { SERVER_HOST, SERVER_PORT } from './common/env'
import logger from './utils/logger';

import { route } from './route';



const server = new grpc.Server();
// Add the routes

logger.info(`Server running at ${SERVER_HOST}:${SERVER_PORT}`);
server.bind(`${SERVER_HOST}:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure());
route(server);


server.start();

