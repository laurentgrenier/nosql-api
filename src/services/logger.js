const path = require('path')
const util = require('util')
const winston = require('winston')
let date = new Date().toISOString();
const consoleFormat = winston.format.printf(info => {
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}` +
  (Object.keys(info.metadata).length
    ? ', ' + util.inspect(info.metadata, false, 10, true)
    : ''
  )
})

var logDir
if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'staging'){
  logDir = process.env.LOG_PATH || '../data/logs/'
  if (!process.env.LOG_PATH) {
    throw new Error('LOG_PATH must be set in environment, exiting...')
    process.exit()
  }
} else {
  logDir = path.join(process.cwd(), 'data/logs/')
}

// https://github.com/winstonjs/winston/issues/1243

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.label({ label: path.basename(process.mainModule.filename) }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Format the metadata object
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
  ),
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: logDir + 'node-agenda-sas-api-' + process.env.NODE_ENV + '-combined.log',
      maxsize: 5242880, //5MB
      maxFiles: 5,
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.json()
      )
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: false,
      format: winston.format.combine(winston.format.colorize(), consoleFormat)
    })
  ],
  exitOnError: false
})

module.exports = logger
module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message.slice(0, -1))
  }
}