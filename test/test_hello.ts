import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { authenicate, sayHello } from '../src/route';
import * as auth from '../src/auth/auth';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './../src/common/env';
import * as sinon from 'sinon';
import * as grpc from 'grpc';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('Hello Test', () => {
  const username = 'testuser_001';
  let validToken = '';

  // Sign a valid token
  before(async () => {
    validToken = await jwt.sign({ username }, JWT_SECRET);
  });

  describe('Auth', () => {
    it('Should get the payload from the signed token', async () => {

      const payload = await auth.verify(validToken);
      expect(payload).to.be.not.null;
      expect(payload).to.be.not.undefined;
      expect(payload.username).to.be.equal(username);
    });

    it('Should throw an error when sending the wrong token', async () => {
      const token = `${validToken}_failed`;
      await expect(auth.verify(token)).to.eventually.be.rejectedWith(Error);
    });
  })

  describe('Route', () => {




    it('Should call the callback once with the username if the token is valid', async function () {
      // Create the call object to simulate the param for gRPC
      const mockCall = {
        metadata: {
          get: (key) => {
            if (key === 'authorization') {
              return [`Bearer ${validToken}`];
            }
          }
        }
      }

      // Create a spy to test the callback is called with correct param
      const next = sinon.spy(sayHello);
      const callback = sinon.spy();

      await authenicate(next)(mockCall, callback);
      expect(callback.calledOnce).to.be.true;
      expect(callback.calledWith(null, { message: `Hello ${username}` })).to.be.true;

    })

    it('Should call the callback with error if the token is missing', async function () {
      // Create the call object to simulate the param for gRPC
      const mockCall = {
        metadata: {
          get: (key) => {
            return undefined;
          }
        }
      }

      // Create a spy to test the callback is called with correct param
      const next = sinon.spy(sayHello);
      const callback = sinon.spy();

      await authenicate(next)(mockCall, callback);
      expect(callback.calledOnce).to.be.true;

      const params = callback.getCall(0).args;
      expect(params[0]).to.be.a('Error');
      expect(params[0].code).to.be.eq(grpc.status.PERMISSION_DENIED);
      expect(params[0].message).to.be.contain('Unauthenicated');
    })

    it('Should call the callback with error if the token is invalid', async function () {
      // Create the call object to simulate the param for gRPC
      const mockCall = {
        metadata: {
          get: (key) => {
            if (key === 'authorization') {
              return [`Bearer ${validToken}_with_wrong_prefix`];
            }
          }
        }
      }

      // Create a spy to test the callback is called with correct param
      const next = sinon.spy(sayHello);
      const callback = sinon.spy();

      await authenicate(next)(mockCall, callback);
      expect(callback.calledOnce).to.be.true;

      const params = callback.getCall(0).args;
      expect(params[0]).to.be.a('Error');
      expect(params[0].code).to.be.eq(grpc.status.PERMISSION_DENIED);
      expect(params[0].message).to.be.contain('Unauthenicated');
    })

    it('Should call the callback with error if the token is expired', async function () {
      // create a expired token
      // issue at 150s before, but will expire in 120s
      const expiredToken = await jwt.sign({ username, iat: Math.floor(Date.now() / 1000) - 150 }, JWT_SECRET, {
        expiresIn: '120s'
      });

      // Create the call object to simulate the param for gRPC
      const mockCall = {
        metadata: {
          get: (key) => {
            if (key === 'authorization') {
              return [`Bearer ${expiredToken}`];
            }
          }
        }
      }

      // Create a spy to test the callback is called with correct param
      const next = sinon.spy(sayHello);
      const callback = sinon.spy();

      await authenicate(next)(mockCall, callback);
      expect(callback.calledOnce).to.be.true;

      const params = callback.getCall(0).args;
      expect(params[0]).to.be.a('Error');
      expect(params[0].code).to.be.eq(grpc.status.PERMISSION_DENIED);
      expect(params[0].message).to.be.contain('Unauthenicated');
    })

  });



});
