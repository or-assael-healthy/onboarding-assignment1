import * as fs from "fs";

import { LogDestination, Logger } from "./logger";

const logger = new Logger();

describe("Test Logger.debug functionality", () => {
  test("Logs to console", () => {
    // ARRANGE
    const logToConsoleSpy = jest.spyOn(
      Logger.prototype as any,
      "_logToConsoleWrapper"
    );
    const debugPrefix = logger["logPrefix"].debug;
    // ACT
    logger.debug("Debug message");
    // ASSERT
    expect(logToConsoleSpy).toHaveBeenCalledWith("Debug message", debugPrefix);
  });

  test("Logs to a new file", async () => {
    // ARRANGE
    const fileName = __dirname + "/test.log";
    fs.rmSync(fileName, { force: true });
    const debugPrefix = logger["logPrefix"].debug;
    const msg1 = "Debug message";

    // ACT
    await logger.debug(msg1, LogDestination.File, fileName);

    // ASSERT
    const data = fs.readFileSync(fileName, "utf8");
    expect(data).toEqual(logger.formatMessageForFile(msg1, debugPrefix));
  });

  test("Multiple logs to an existing file", async () => {
    // ARRANGE
    const fileName = __dirname + "/test.log";
    fs.rmSync(fileName, { force: true });
    const debugPrefix = logger["logPrefix"].debug;
    const msg1 = "Debug message";
    const msg2 = "Debug message 2";

    // ACT
    await logger.debug(msg1, LogDestination.File, fileName);
    await logger.debug(msg2, LogDestination.File, fileName);

    // ASSERT
    const data = fs.readFileSync(fileName, "utf8");
    expect(data).toEqual(logger.formatMessageForFile(msg1, debugPrefix));
    expect(data).toEqual(logger.formatMessageForFile(msg2, debugPrefix));
  });

  test("Log a large message to file", async () => {
    // ARRANGE
    const fileName = __dirname + "/test.log";
    fs.rmSync(fileName, { force: true });
    const debugPrefix = logger["logPrefix"].debug;
    const msg1 = "Debug message".repeat(1000);

    // ACT
    await logger.debug(msg1, LogDestination.File, fileName);

    // ASSERT
    const data = fs.readFileSync(fileName, "utf8");
    expect(data).toEqual(logger.formatMessageForFile(msg1, debugPrefix));
  });

  test("Test singleton functionality", () => {
    // ARRANGE
    const logger1 = Logger.getLogger();
    const logger2 = Logger.getLogger();

    // ASSERT
    expect(logger1).toEqual(logger2);
  });
});
