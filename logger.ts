import { once } from "events";
import * as fs from "fs";
import * as util from "util";
import * as stream from "stream";

enum LogDestination {
  Console,
  File,
}

class Logger {
  private logDestination: LogDestination;
  private logFileName: string;
  private logFileStream: fs.WriteStream;
  private defaultLogger: Logger | undefined;

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
  getLogger() {
    if (!this.defaultLogger) {
      this.defaultLogger = new Logger();
    }
    return this.defaultLogger;
  }

  async debug(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    if (this._isLogToConsole(logDestination)) {
      console.debug(message);
    } else {
      await this._logToFile(
        this._formatMessageForFile(message, this.logPrefix.debug),
        logFileName
      );
    }
  }

  async info(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    if (this._isLogToConsole(logDestination)) {
      console.info(message);
    } else {
      await this._logToFile(
        this._formatMessageForFile(message, this.logPrefix.info),
        logFileName
      );
    }
  }

  async warn(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    if (this._isLogToConsole(logDestination)) {
      console.warn(message);
    } else {
      await this._logToFile(
        this._formatMessageForFile(message, this.logPrefix.warn),
        logFileName
      );
    }
  }

  async error(
    message: string,
    logDestination?: LogDestination,
    logFileName?: string
  ) {
    if (this._isLogToConsole(logDestination)) {
      console.error(message);
    } else {
      await this._logToFile(
        this._formatMessageForFile(message, this.logPrefix.error),
        logFileName
      );
    }
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

  private async _logToFile(message: string, logFileName?: string) {
    if (logFileName && logFileName !== this.logFileName) {
      const tempFIleStream = fs.createWriteStream(logFileName, {
        encoding: "utf-8",
        flags: "a",
      });
      await this._logToFileByChunks(message, tempFIleStream);
      tempFIleStream.end();
      await this.streamFinshed(tempFIleStream);
    } else {
      await this._logToFileByChunks(message, this.logFileStream);
    }
  }

  private async _logToFileByChunks(
    message: string,
    fileStream: fs.WriteStream
  ) {
    for await (const chunk of message) {
      if (!fileStream.write(chunk)) {
        await once(fileStream, "drain");
      }
    }
  }

  private _formatMessageForFile(message: string, prefix: string): string {
    return prefix + message + "\n";
  }
}

export { Logger, LogDestination };
