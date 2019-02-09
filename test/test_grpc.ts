import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { authenicate, sayHello } from '../src/route';
import * as auth from '../src/auth/auth';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './../src/common/env';
import * as sinon from 'sinon';
import * as grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';

import { SERVER_HOST, SERVER_PORT } from './../src/common/env'
import server from './../src/server';


//Load the protobuf
const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync('proto/hello.proto')
);

const { expect } = chai;

chai.use(chaiAsPromised);

describe('GRPC Test', () => {
  let client:grpc.Client;

  beforeEach(() => {

    console.log('each');
    //Create gRPC client
    client = new proto.HelloService(
      `${SERVER_HOST}:${SERVER_HOST}`,
      grpc.credentials.createInsecure()
    );
  });

  afterEach(() => {
    client.close();
    client = null;
  });

  // Shut down the server
  after((done) => {
    server.tryShutdown(() => {
      done();
    })
  })

  describe('HelloService', () => {
    it('should return error if authorization header is not provider', () => {
      expect(false).to.be.true;
    })

    it('should return error if bearer token is invalid', () => {
      expect(false).to.be.true;
    })

    it('should return error if bearer token is expired', () => {
      expect(false).to.be.true;
    })

    it('should return the username for the Hello Service', () => {
      expect(false).to.be.true;
    })
  });


});