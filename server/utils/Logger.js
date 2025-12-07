/**
 * Structured Logging Utility for Server
 *
 * Provides consistent, structured logging across the application.
 * Supports different log levels and optional debug mode for verbose output.
 */

class Logger {
  /**
   * Log an info-level message (only shown when DEBUG=1)
   * @param {string} context - Context/module name
   * @param {string} message - Log message
   * @param {object} data - Additional context data
   */
  static info(context, message, data = {}) {
    if (process.env.DEBUG === "1" || process.env.DEBUG_QUOTA === "1") {
      const log = {
        timestamp: new Date().toISOString(),
        level: "INFO",
        context,
        message,
        ...data,
      };
      console.log(JSON.stringify(log));
    }
  }

  /**
   * Log a warning-level message (always shown)
   * @param {string} context - Context/module name
   * @param {string} message - Log message
   * @param {object} data - Additional context data
   */
  static warn(context, message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: "WARN",
      context,
      message,
      ...data,
    };
    console.warn(JSON.stringify(log));
  }

  /**
   * Log an error-level message (always shown)
   * @param {string} context - Context/module name
   * @param {string} message - Log message
   * @param {object} data - Additional context data
   */
  static error(context, message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      context,
      message,
      ...data,
    };
    console.error(JSON.stringify(log));
  }

  /**
   * Log a debug-level message (only shown when DEBUG=1)
   * @param {string} context - Context/module name
   * @param {string} message - Log message
   * @param {object} data - Additional context data
   */
  static debug(context, message, data = {}) {
    if (process.env.DEBUG === "1" || process.env.DEBUG_QUOTA === "1") {
      const log = {
        timestamp: new Date().toISOString(),
        level: "DEBUG",
        context,
        message,
        ...data,
      };
      console.log(JSON.stringify(log));
    }
  }
}

module.exports = Logger;
