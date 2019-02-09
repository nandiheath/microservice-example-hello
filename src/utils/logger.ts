import * as winston from 'winston';
const { LOGGER_LEVEL } = require('./../common/env');

const logger = winston.createLogger({
  level: LOGGER_LEVEL,
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' })
    new winston.transports.Console({
      level: LOGGER_LEVEL,
      format: winston.format.simple()
    })
  ]
});


export default logger;
