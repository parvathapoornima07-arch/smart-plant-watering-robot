import morgan, { type StreamOptions } from "morgan";
import { log } from "../utils/logger";

const stream: StreamOptions = {
  write: (message) => log.info(message.trim(), { component: "http" }),
};

/**
 * Request logging. Uses the standard 'combined'-like format but NOT body
 * content, so credentials are never written to logs. In test mode we skip
 * logging to keep test output clean.
 */
export function requestLogger(skip = false) {
  return morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream,
    skip: () => skip,
  });
}
