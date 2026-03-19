import { configProvider } from 'src/config/configProvider';
import winston, { format } from 'winston';

const isDevelopment = configProvider.get('DEVELOPMENT');
console.log('Logger initialized. Development mode: %s', isDevelopment);

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
  ),
});

logger.add(
  new winston.transports.Console({
    format: format.combine(
      format.splat(),
      format.colorize(),
      format.timestamp({ format: 'HH:mm:ss' }),
      format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level}] ${message} ${metaString}`;
      }),
    ),
  }),
);

if (!isDevelopment) {
  logger.add(
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  );
  logger.add(new winston.transports.File({ filename: 'combined.log' }));
}

type LogMethod = 'info' | 'warn' | 'error' | 'debug';
const wasDisplayed = new Map<LogMethod, boolean>();

const wrapConsole =
  (method: LogMethod) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]) => {
    if (!wasDisplayed.get(method)) {
      logger.warn(
        `Using console.${method} is discouraged. Please use the logger instance instead.`,
      );
      wasDisplayed.set(method, true);
    }
    logger[method](args[0], ...args.slice(1));
  };

console.log = wrapConsole('info');
console.info = wrapConsole('info');
console.warn = wrapConsole('warn');
console.error = wrapConsole('error');
console.debug = wrapConsole('debug');

const extendedLogger = Object.assign(logger, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onlyDev: (message: string, ...meta: any[]) => {
    if (isDevelopment) {
      logger.debug(message, ...meta);
    }
  },
});

export default extendedLogger;
