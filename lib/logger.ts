/* eslint-disable no-console */

type LogLevel = "debug" | "info" | "warn" | "error";

const shouldLog = (level: LogLevel) => {
  if (level === "error" || level === "warn") {
    return true;
  }

  return process.env.NODE_ENV !== "production";
};

const log =
  (level: LogLevel) =>
  (...args: unknown[]) => {
    if (!shouldLog(level)) {
      return;
    }

    switch (level) {
      case "debug":
        console.debug(...args);
        break;
      case "info":
        console.info(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
      default:
        console.error(...args);
        break;
    }
  };

export const logger = {
  debug: log("debug"),
  info: log("info"),
  warn: log("warn"),
  error: log("error"),
};
