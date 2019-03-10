
// somw working version of the logger before MORGAN

var winston = require('winston');
//winston.add(winston.transports.Console, );
var mypath = module.filename.split('/').slice(-2).join('/');

var path = require('path');
const logger = winston.createLogger({
    level: 'info',
    
    format: winston.format.combine(
        winston.format.label({ label: module.filename.split('/').slice(-2).join('/') }),winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
     
      new winston.transports.File({ filename: path.join(__dirname , '..','logs/error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(__dirname , '..','logs/all_logs.log') })
     
    ]
  });
for (key in winston.loggers.loggers) {
    winston.loggers.loggers[key].remove(winston.transports.Console);
}
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  
}
module.exports = logger;



/*
//Logging with Morgan
var winston = require('winston');
var path = require('path');
//winston.emitErrs = true;

var logger = new winston.createLogger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: path.join(__dirname , '..','logs/all_logs.log'),
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
*/