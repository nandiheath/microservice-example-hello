const BluebirdPromise = require('bluebird');
const jwt = BluebirdPromise.promisifyAll(require('jsonwebtoken'));
const { JWT_SECRET } = require('../common/env');

export const verify = async (token) => {
  const payload = await jwt.verifyAsync(token, JWT_SECRET);
  return payload;
}

