import { LogDestination, Logger } from "./logger.js";

const logger = new Logger();
await logger.debug("Debug message2", LogDestination.File, "./log.txt");
await logger.debug("Debug message3", LogDestination.File, "./log2.txt");
