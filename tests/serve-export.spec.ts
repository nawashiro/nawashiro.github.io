import { test, expect } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

type ResolveExportPath = (
  rootDir: string,
  requestPath: string,
) => string | null;

type HttpResponse = {
  statusCode: number;
  body: string;
  contentType: string | undefined;
};

type RunningExportServer = {
  child: ChildProcess;
  output: () => string;
};

const loadResolveExportPath = async (): Promise<ResolveExportPath> => {
  const moduleUrl = pathToFileURL(
    path.resolve(__dirname, "../scripts/serve-export.mjs"),
  ).href;
  const module = (await import(moduleUrl)) as {
    resolveExportPath?: ResolveExportPath;
  };

  if (typeof module.resolveExportPath !== "function") {
    throw new Error("scripts/serve-export.mjs must export resolveExportPath");
  }

  return module.resolveExportPath;
};

const createFixture = () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "serve-export-resolver-test-"),
  );
  const rootDir = path.join(temporaryDirectory, "out");

  fs.mkdirSync(path.join(rootDir, "assets"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "posts"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "docs"), { recursive: true });
  fs.writeFileSync(path.join(rootDir, "index.html"), "home");
  fs.writeFileSync(path.join(rootDir, "assets", "app.css"), "body {}");
  fs.writeFileSync(path.join(rootDir, "posts", "example.html"), "post");
  fs.writeFileSync(path.join(rootDir, "docs", "index.html"), "docs");
  fs.writeFileSync(path.join(temporaryDirectory, "outside.txt"), "outside");

  return { rootDir, temporaryDirectory };
};

const removeFixture = (temporaryDirectory: string) => {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
};

const exportServerScript = path.resolve(
  __dirname,
  "../scripts/serve-export.mjs",
);

const getUnusedPort = async (): Promise<number> => {
  const probe = net.createServer();

  await new Promise<void>((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => resolve());
  });

  const address = probe.address();
  if (!address || typeof address === "string") {
    await new Promise<void>((resolve) => probe.close(() => resolve()));
    throw new Error("Could not determine an available test port");
  }

  const port = address.port;
  await new Promise<void>((resolve, reject) => {
    probe.close((error) => (error ? reject(error) : resolve()));
  });

  return port;
};

const spawnExportServer = (
  workingDirectory: string,
  port: number,
): RunningExportServer => {
  let output = "";
  const child = spawn(process.execPath, [exportServerScript], {
    cwd: workingDirectory,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout?.setEncoding("utf8");
  child.stdout?.on("data", (chunk) => {
    output += String(chunk);
  });
  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (chunk) => {
    output += String(chunk);
  });
  child.on("error", (error) => {
    output += `${error.message}\n`;
  });

  return { child, output: () => output };
};

const waitForExit = (
  server: RunningExportServer,
  timeoutMilliseconds = 3_000,
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Export server did not exit within ${timeoutMilliseconds}ms:\n${server.output()}`,
        ),
      );
    }, timeoutMilliseconds);

    server.child.once("close", (code, signal) => {
      clearTimeout(timeout);
      resolve({ code, signal });
    });
  });

const stopExportServer = async (child: ChildProcess): Promise<void> => {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    let timeout: NodeJS.Timeout | undefined;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
      resolve();
    };

    child.once("close", finish);
    timeout = setTimeout(() => {
      child.kill("SIGKILL");
      finish();
    }, 1_000);

    if (!child.kill()) {
      finish();
    }
  });
};

const requestHttpResponse = (
  port: number,
  requestPath: string,
): Promise<HttpResponse> =>
  new Promise((resolve, reject) => {
    let settled = false;
    let timeout: NodeJS.Timeout | undefined;
    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
      callback();
    };

    const request = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: requestPath,
        method: "GET",
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += String(chunk);
        });
        response.once("error", (error) => finish(() => reject(error)));
        response.once("end", () =>
          finish(() =>
            resolve({
              statusCode: response.statusCode ?? 0,
              body,
              contentType:
                typeof response.headers["content-type"] === "string"
                  ? response.headers["content-type"]
                  : undefined,
            }),
          ),
        );
      },
    );

    request.once("error", (error) => finish(() => reject(error)));
    timeout = setTimeout(() => {
      request.destroy(new Error("HTTP request timed out"));
    }, 1_000);
    request.end();
  });

const waitForHttpResponse = async (
  server: RunningExportServer,
  port: number,
  requestPath: string,
  timeoutMilliseconds = 3_000,
): Promise<HttpResponse> => {
  const deadline = Date.now() + timeoutMilliseconds;
  let lastError: unknown;

  while (Date.now() < deadline) {
    if (server.child.exitCode !== null || server.child.signalCode !== null) {
      throw new Error(
        `Export server exited before becoming ready:\n${server.output()}`,
      );
    }

    try {
      return await requestHttpResponse(port, requestPath);
    } catch (error) {
      lastError = error;
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 50));
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Export server did not become ready within ${timeoutMilliseconds}ms: ${message}\n${server.output()}`,
  );
};

test("resolves / to out/index.html", async () => {
  const fixture = createFixture();

  try {
    const resolveExportPath = await loadResolveExportPath();

    expect(resolveExportPath(fixture.rootDir, "/")).toBe(
      path.join(fixture.rootDir, "index.html"),
    );
  } finally {
    removeFixture(fixture.temporaryDirectory);
  }
});

test("resolves exact static files without changing their paths", async () => {
  const fixture = createFixture();

  try {
    const resolveExportPath = await loadResolveExportPath();

    expect(resolveExportPath(fixture.rootDir, "/assets/app.css")).toBe(
      path.join(fixture.rootDir, "assets", "app.css"),
    );
    expect(resolveExportPath(fixture.rootDir, "/posts/example.html")).toBe(
      path.join(fixture.rootDir, "posts", "example.html"),
    );
  } finally {
    removeFixture(fixture.temporaryDirectory);
  }
});

test("resolves extensionless post URLs to their HTML files", async () => {
  const fixture = createFixture();

  try {
    const resolveExportPath = await loadResolveExportPath();

    expect(resolveExportPath(fixture.rootDir, "/posts/example")).toBe(
      path.join(fixture.rootDir, "posts", "example.html"),
    );
  } finally {
    removeFixture(fixture.temporaryDirectory);
  }
});

test("resolves a directory request to its index.html", async () => {
  const fixture = createFixture();

  try {
    const resolveExportPath = await loadResolveExportPath();

    expect(resolveExportPath(fixture.rootDir, "/docs/")).toBe(
      path.join(fixture.rootDir, "docs", "index.html"),
    );
  } finally {
    removeFixture(fixture.temporaryDirectory);
  }
});

test("rejects traversal outside the export root", async () => {
  const fixture = createFixture();

  try {
    const resolveExportPath = await loadResolveExportPath();

    expect(resolveExportPath(fixture.rootDir, "/%2e%2e/outside.txt")).toBeNull();
  } finally {
    removeFixture(fixture.temporaryDirectory);
  }
});

test("returns null for a missing route", async () => {
  const fixture = createFixture();

  try {
    const resolveExportPath = await loadResolveExportPath();

    expect(resolveExportPath(fixture.rootDir, "/missing")).toBeNull();
  } finally {
    removeFixture(fixture.temporaryDirectory);
  }
});

test("fails clearly when out/index.html is absent", async () => {
  const fixture = createFixture();
  let server: RunningExportServer | undefined;

  try {
    await loadResolveExportPath();
    fs.rmSync(path.join(fixture.rootDir, "index.html"));
    const port = await getUnusedPort();
    server = spawnExportServer(fixture.temporaryDirectory, port);

    const exit = await waitForExit(server);

    expect(exit.code).not.toBe(0);
    expect(server.output()).toContain("out/index.html");
  } finally {
    if (server) {
      await stopExportServer(server.child);
    }
    removeFixture(fixture.temporaryDirectory);
  }
});

test("serves export routes with HTTP status responses", async () => {
  const fixture = createFixture();
  let server: RunningExportServer | undefined;

  try {
    await loadResolveExportPath();
    const port = await getUnusedPort();
    server = spawnExportServer(fixture.temporaryDirectory, port);

    const home = await waitForHttpResponse(server, port, "/");
    expect(home.statusCode).toBe(200);
    expect(home.body).toBe("home");

    const exactFile = await requestHttpResponse(port, "/posts/example.html");
    expect(exactFile.statusCode).toBe(200);
    expect(exactFile.body).toBe("post");

    const directoryIndex = await requestHttpResponse(port, "/docs/");
    expect(directoryIndex.statusCode).toBe(200);
    expect(directoryIndex.body).toBe("docs");

    const stylesheet = await requestHttpResponse(port, "/assets/app.css");
    expect(stylesheet.statusCode).toBe(200);
    expect(stylesheet.body).toBe("body {}");
    expect(stylesheet.contentType).toMatch(/^text\/css(?:;|$)/);

    const post = await requestHttpResponse(port, "/posts/example");
    expect(post.statusCode).toBe(200);
    expect(post.body).toBe("post");

    const missing = await requestHttpResponse(port, "/missing");
    expect(missing.statusCode).toBe(404);

    const traversal = await requestHttpResponse(
      port,
      "/%2e%2e/outside.txt",
    );
    expect(traversal.statusCode).toBe(404);
  } finally {
    if (server) {
      await stopExportServer(server.child);
    }
    removeFixture(fixture.temporaryDirectory);
  }
});
