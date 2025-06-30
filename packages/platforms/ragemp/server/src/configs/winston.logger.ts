import { createLogger, format, transports, addColors } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const path = require('path');

const { combine, timestamp, printf, colorize } = format;

addColors({
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'magenta',
});

const consoleTransport = new transports.Console({
    format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ timestamp, level, message }) => `[${timestamp}] [${level}] ${message}`),
    ),
});

const fileTransport = new DailyRotateFile({
    dirname: path.resolve(__dirname, '../../logs'),
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`),
    ),
});

export const winstonLogger = createLogger({
    level: 'debug',
    transports: [consoleTransport, fileTransport],
});
