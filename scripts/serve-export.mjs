import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 3000;

const MIME_TYPES = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const isPathInside = (rootDir, candidatePath) => {
  const relativePath = path.relative(rootDir, candidatePath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== ".." &&
      !path.isAbsolute(relativePath))
  );
};

const decodeRequestPath = (requestPath) => {
  const pathWithoutQuery = String(requestPath).split(/[?#]/, 1)[0] || "/";

  try {
    const decodedPath = decodeURIComponent(pathWithoutQuery);

    if (decodedPath.includes("\0") || decodedPath.includes("\\")) {
      return null;
    }

    return decodedPath.startsWith("/") ? decodedPath : `/${decodedPath}`;
  } catch {
    return null;
  }
};

const getRootPaths = (rootDir) => {
  const resolvedRoot = path.resolve(rootDir);
  const realRoot = fs.realpathSync(resolvedRoot);

  return { resolvedRoot, realRoot };
};

const isRegularFileInsideRoot = (rootDir, realRoot, candidatePath) => {
  if (!isPathInside(rootDir, candidatePath)) {
    return false;
  }

  try {
    if (!fs.statSync(candidatePath).isFile()) {
      return false;
    }

    return isPathInside(realRoot, fs.realpathSync(candidatePath));
  } catch {
    return false;
  }
};

const isDirectoryInsideRoot = (rootDir, realRoot, candidatePath) => {
  if (!isPathInside(rootDir, candidatePath)) {
    return false;
  }

  try {
    if (!fs.statSync(candidatePath).isDirectory()) {
      return false;
    }

    return isPathInside(realRoot, fs.realpathSync(candidatePath));
  } catch {
    return false;
  }
};

/**
 * Resolve a request URL path to a regular file in a static export.
 *
 * @param {string} rootDir
 * @param {string} requestPath
 * @returns {string | null}
 */
export const resolveExportPath = (rootDir, requestPath) => {
  const decodedPath = decodeRequestPath(requestPath);
  if (decodedPath === null) {
    return null;
  }

  let rootPaths;
  try {
    rootPaths = getRootPaths(rootDir);
  } catch {
    return null;
  }

  const { resolvedRoot, realRoot } = rootPaths;
  const relativeRequestPath = decodedPath.slice(1);
  const candidatePath = path.resolve(resolvedRoot, relativeRequestPath);

  if (!isPathInside(resolvedRoot, candidatePath)) {
    return null;
  }

  if (decodedPath === "/") {
    const indexPath = path.join(resolvedRoot, "index.html");
    return isRegularFileInsideRoot(resolvedRoot, realRoot, indexPath)
      ? indexPath
      : null;
  }

  if (isRegularFileInsideRoot(resolvedRoot, realRoot, candidatePath)) {
    return candidatePath;
  }

  const htmlPath = `${candidatePath}.html`;
  if (isRegularFileInsideRoot(resolvedRoot, realRoot, htmlPath)) {
    return htmlPath;
  }

  if (isDirectoryInsideRoot(resolvedRoot, realRoot, candidatePath)) {
    const indexPath = path.join(candidatePath, "index.html");
    if (isRegularFileInsideRoot(resolvedRoot, realRoot, indexPath)) {
      return indexPath;
    }
  }

  return null;
};

/**
 * Verify that a static export has the root document required by the server.
 *
 * @param {string} rootDir
 * @returns {string} the absolute path to index.html
 * @throws {Error} when the export root or index document is unavailable
 */
export const assertExportReady = (rootDir) => {
  const resolvedRoot = path.resolve(rootDir);
  const indexPath = path.join(resolvedRoot, "index.html");

  try {
    const { realRoot } = getRootPaths(resolvedRoot);
    if (isRegularFileInsideRoot(resolvedRoot, realRoot, indexPath)) {
      return indexPath;
    }
  } catch {
    // Fall through to the actionable error below.
  }

  throw new Error(
    `Static export is not ready: expected out/index.html at ${indexPath}`,
  );
};

const getMimeType = (filePath) =>
  MIME_TYPES[path.extname(filePath).toLowerCase()] ??
  "application/octet-stream";

const sendNotFound = (response) => {
  const body = "Not Found\n";
  response.statusCode = 404;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
};

const sendMethodNotAllowed = (response) => {
  const body = "Method Not Allowed\n";
  response.statusCode = 405;
  response.setHeader("Allow", "GET, HEAD");
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
};

const serveFile = (request, response, filePath, statusCode) => {
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      sendNotFound(response);
      return;
    }

    response.statusCode = statusCode;
    response.setHeader("Content-Type", getMimeType(filePath));
    response.setHeader("Content-Length", contents.byteLength);
    response.end(request.method === "HEAD" ? undefined : contents);
  });
};

/**
 * Create the HTTP server for a static export directory.
 *
 * @param {string} rootDir
 * @returns {import("node:http").Server}
 */
export const createExportServer = (rootDir) =>
  http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendMethodNotAllowed(response);
      return;
    }

    const filePath = resolveExportPath(rootDir, request.url ?? "/");
    if (filePath !== null) {
      serveFile(request, response, filePath, 200);
      return;
    }

    const notFoundPath = resolveExportPath(rootDir, "/404.html");
    if (notFoundPath !== null) {
      serveFile(request, response, notFoundPath, 404);
      return;
    }

    sendNotFound(response);
  });

const parsePort = (value) => {
  if (value === undefined || value === "") {
    return DEFAULT_PORT;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
};

/**
 * Check the export, start serving it, and return the listening server.
 *
 * @param {string} rootDir
 * @param {number} port
 * @returns {import("node:http").Server}
 */
export const startExportServer = (
  rootDir = path.resolve(process.cwd(), "out"),
  port = parsePort(process.env.PORT),
) => {
  assertExportReady(rootDir);

  const server = createExportServer(rootDir);
  server.once("error", (error) => {
    console.error(`Static export server failed: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, () => {
    const address = server.address();
    const listeningPort =
      address && typeof address === "object" ? address.port : port;
    console.log(`Static export server listening on port ${listeningPort}`);
  });

  return server;
};

const isMainModule =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  try {
    startExportServer();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Static export server failed: ${message}`);
    process.exitCode = 1;
  }
}
