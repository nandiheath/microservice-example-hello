import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { authenicate, sayHello } from '../src/route';
import * as auth from '../src/auth/auth';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './../src/common/env';
import * as sinon from 'sinon';
import * as BluebirdPromise from 'bluebird';


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


    const mockCall = {
      metadata: {
        get: (key) => {
          if (key === 'authorization') {
            return [`Bearer ${validToken}`];
          }
        }
      }
    }

    it('Should call the callback once if the token is valid', async function() {
      const next = sinon.spy(sayHello);
      const callback = sinon.spy();

      await authenicate(next)(mockCall, callback);
      expect(callback.calledOnce).to.be.true;
      expect(callback.calledWith(null, `Hello ${username}`)).to.be.true;

    })

    it('Should call the callback with error if the token is missing', async function() {
      expect(false).to.be.true;
    })

    it('Should call the callback with error if the token is invalid', async function() {
      expect(false).to.be.true;
    })

    it('Should call the callback with error if the token is expired', async function() {
      expect(false).to.be.true;
    })

    it('Should call the callback with the username', async function() {
      expect(false).to.be.true;
    })
  });



});
