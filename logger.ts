import * as fs from "fs";
import * as stream from "stream";
import * as util from "util";

import { promisify } from "util";

enum LogDestination {
  Console,
  File,
}

class Logger {
  private logDestination: LogDestination;
  private logFileName: string;
  private logFileStream: fs.WriteStream;
  private static defaultLogger: Logger | undefined;

  // This is a promisified version of stream.finished to wait for the stream to finish writing
  private streamFinshed = util.promisify(stream.finished);

  private logPrefix = {
    debug: "[DEBUG]:",
    info: "[INFO]:",
    warn: "[WARN]:",
    error: "[ERROR]:",
  };

  constructor(
    logDestination: LogDestination = LogDestination.Console,
    logFileName: string = "./log.txt"
  ) {
    this.logDestination = logDestination;
    this.logFileName = logFileName;
    this.logFileStream = fs.createWriteStream(logFileName, {
      encoding: "utf-8",
      flags: "a",
    });
  }

  // This allows a singleton logger to be used throughout the application if needed
  /**
   * call this method to get a singleton instance of the Logger class
   * @returns {Logger} A singleton instance of the Logger class
   */
  static getLogger(): Logger {
    if (!Logger.defaultLogger) {
      Logger.defaultLogger = new Logger();
    }
    return Logger.defaultLogger;
  }

  async debug(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    this._logToDestination(
      message,
      this.logPrefix.debug,
      logDestination,
      logFileName
    );
  }

  async info(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    this._logToDestination(
      message,
      this.logPrefix.info,
      logDestination,
      logFileName
    );
  }

  async warn(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    this._logToDestination(
      message,
      this.logPrefix.warn,
      logDestination,
      logFileName
    );
  }

  async error(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    this._logToDestination(
      message,
      this.logPrefix.error,
      logDestination,
      logFileName
    );
  }

  changeLogDestination(
    logDestination: LogDestination,
    logFileName: string = "./log.txt"
  ) {
    this.logDestination = logDestination;
    this.logFileName = logFileName;
  }

  private _isLogToConsole(logDestination?: LogDestination): boolean {
    if (logDestination) {
      return (logDestination as LogDestination) === LogDestination.Console;
    } else {
      return this.logDestination === LogDestination.Console;
    }
  }

  private async _logToFile(
    message: string,
    prefix: string,
    logFileName?: string
  ) {
    const formattedMessage = this.formatMessageForFile(message, prefix);

    if (logFileName && logFileName !== this.logFileName) {
      const tempFIleStream = fs.createWriteStream(logFileName, {
        encoding: "utf-8",
        flags: "a",
      });
      await this._logToFileByChunks(formattedMessage, tempFIleStream);
      tempFIleStream.end();
      await this.streamFinshed(tempFIleStream);
    } else {
      await this._logToFileByChunks(formattedMessage, this.logFileStream);
    }
  }

  private async _logToFileByChunks(
    message: string,
    fileStream: fs.WriteStream
  ) {
    for await (const chunk of message) {
      const pipeline = promisify(stream.pipeline);
      pipeline(chunk, fileStream).catch((err) => {
        console.error("Pipeline failed.", err);
        fileStream.end();
      });
    }
  }

  public formatMessageForFile(message: string, prefix: string): string {
    return prefix + message + "\n";
  }

  private async _logToDestination(
    message: string,
    prefix: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    if (this._isLogToConsole(logDestination)) {
      this._logToConsoleWrapper(message, prefix);
    } else {
      await this._logToFile(message, prefix, logFileName);
    }
  }
  // This is done for testing purposes
  private _logToConsoleWrapper(message: string, prefix: string) {
    switch (prefix) {
      case this.logPrefix.debug:
        console.debug(message);
        break;
      case this.logPrefix.info:
        console.info(message);
        break;
      case this.logPrefix.warn:
        console.warn(message);
        break;
      case this.logPrefix.error:
        console.error(message);
        break;
    }
  }
}

export { Logger, LogDestination };
