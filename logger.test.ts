import * as fs from "fs";

import { LogDestination, Logger } from "./logger";

const logger = new Logger();

describe("Test Logger.debug functionality", () => {
  test("Logs to console", () => {
    // ARRANGE
    console.debug = jest.fn();
    // ACT
    logger.debug("Debug message");
    // ASSERT
    expect(console.debug).toHaveBeenCalledWith("Debug message");
  });

  test("Logs to a new file", async () => {
    // ARRANGE
    const fileName = "./test.log";
    fs.rmSync(fileName, { force: true });

    // ACT
    await logger.debug("Debug message", LogDestination.File, fileName);
    const data = fs.readFileSync("./test.log", "utf8");

    // ASSERT
    expect(data).toContain("Debug message");
  });

  test("Multiple logs to an existing file", async () => {
    // ARRANGE
    const fileName = "./test.log";
    fs.rmSync(fileName, { force: true });

    // ACT
    await logger.debug("Debug message", LogDestination.File, fileName);
    await logger.debug("Debug message 2", LogDestination.File, fileName);
    const data = fs.readFileSync("./test.log", "utf8");

    // ASSERT
    expect(data).toContain("Debug message");
    expect(data).toContain("Debug message 2");
  });

  test("Log a large message to file", async () => {
    // ARRANGE
    const fileName = "./test.log";
    fs.rmSync(fileName, { force: true });

    // ACT
    await logger.debug(
      "Debug message".repeat(1000),
      LogDestination.File,
      fileName
    );
    const data = fs.readFileSync("./test.log", "utf8");

    // ASSERT
    expect(data).toContain("Debug message");
    expect(data).toContain("Debug message".repeat(1000));
  });
});
