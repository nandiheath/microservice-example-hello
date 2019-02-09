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

interface HelloClient extends grpc.Client{
    Hello(payload:Object, callback:Function);
    Hello(payload:Object, metadata:grpc.Metadata, callback:Function);
}

describe('GRPC Test', () => {
  let client:HelloClient;

  beforeEach(() => {

    console.log('each');
    //Create gRPC client
    client = new proto.HelloService(
      `${SERVER_HOST}:${SERVER_PORT}`,
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
    const username = 'testuser_001';

    it('should return error if authorization header is not provider', (done) => {
      client.Hello({}, (err, data) => {
        expect(err).to.be.not.null;
        expect(err.code).to.be.eq(grpc.status.PERMISSION_DENIED);
        expect(err).to.be.a('Error');
        expect(err.message).to.be.contain('Unauthenicated');
        done();
      });
    })

    it('should return error if bearer token is invalid', (done) => {
      const token:string = 'Bearer';
      const metadata:grpc.Metadata = new grpc.Metadata();
      metadata.add('Authorization', token);
      client.Hello({}, metadata, (err, data) => {
        expect(err).to.be.not.null;
        expect(err.code).to.be.eq(grpc.status.PERMISSION_DENIED);
        expect(err).to.be.a('Error');
        expect(err.message).to.be.contain('Unauthenicated');
        done();
      });
    })

    it('should return error if bearer token is expired', (done) => {
      // Sign an expired token
      jwt.sign({ username, iat: Math.floor(Date.now() / 1000) - 150 }, JWT_SECRET, {
        expiresIn: '120s'
      }, (err, token) => {
        expect(err).to.be.null;
        expect(token).to.be.not.null;
        const metadata:grpc.Metadata = new grpc.Metadata();
        metadata.add('Authorization', `Bearer ${token}`);
        client.Hello({}, metadata, (err, data) => {
          expect(err).to.be.not.null;
          expect(err.code).to.be.eq(grpc.status.PERMISSION_DENIED);
          expect(err).to.be.a('Error');
          expect(err.message).to.be.contain('Unauthenicated');
          done();
        });
      });


    })

    it('should return the username for the Hello Service', (done) => {
      jwt.sign({ username }, JWT_SECRET, (err, token) => {
        expect(err).to.be.null;
        expect(token).to.be.not.null;

        const metadata:grpc.Metadata = new grpc.Metadata();
        metadata.add('Authorization', `Bearer ${token}`);
        client.Hello({}, metadata, (err, data) => {
          expect(err).to.be.null;
          expect(data.message).to.be.not.undefined;
          expect(data.message).to.be.eq(`Hello ${username}`);
          done();
        });
      });
    })
  });


});