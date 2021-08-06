import winston from 'winston';

export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: {
        service: 'user-service'
    },
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        }),
        // Write all logs with level `info` and below to `combined.log`
        new winston.transports.File({
            filename: 'combined.log'
        }),
    ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.prettyPrint(),
        level: 'debug',
    }));
}