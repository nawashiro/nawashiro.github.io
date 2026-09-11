import { test, expect } from "@playwright/test";
import { renderMarkdown, shouldEnableExternalFetch } from "../lib/posts";

const env = process.env as Record<string, string | undefined>;
const { gotClient } = require("open-graph-scraper/lib/utils") as {
  gotClient: {
    get: (...args: unknown[]) => Promise<unknown>;
  };
};

const restoreEnvValue = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete env[key];
    return;
  }
  env[key] = value;
};

test("external fetch is disabled in test env", () => {
  const originalNodeEnv = env.NODE_ENV;
  delete env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH;
  env.NODE_ENV = "test";

  try {
    expect(shouldEnableExternalFetch()).toBe(false);
  } finally {
    restoreEnvValue("NODE_ENV", originalNodeEnv);
  }
});

test("external fetch can be disabled via env flag", () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalFlag = env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH;
  delete env.NODE_ENV;
  env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH = "1";

  try {
    expect(shouldEnableExternalFetch()).toBe(false);
  } finally {
    restoreEnvValue("NODE_ENV", originalNodeEnv);
    restoreEnvValue("NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH", originalFlag);
  }
});

test("external fetch is enabled by default", () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalFlag = env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH;
  delete env.NODE_ENV;
  delete env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH;

  try {
    expect(shouldEnableExternalFetch()).toBe(true);
  } finally {
    restoreEnvValue("NODE_ENV", originalNodeEnv);
    restoreEnvValue("NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH", originalFlag);
  }
});

test("renderMarkdown suppresses link-card retrieval when external fetch is disabled", async () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalExternalFetchFlag = env.DISABLE_EXTERNAL_FETCH;
  const originalNextExternalFetchFlag = env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH;
  const originalGet = gotClient.get;
  const retrievalAttempts: string[] = [];
  const scenarios = [
    { name: "NODE_ENV=test", nodeEnv: "test", externalFetchFlag: undefined },
    {
      name: "DISABLE_EXTERNAL_FETCH=1",
      nodeEnv: undefined,
      externalFetchFlag: "1",
    },
  ] as const;
  const attemptsByScenario: Record<string, number> = {};

  gotClient.get = async (...args: unknown[]) => {
    retrievalAttempts.push(String(args[0]));
    throw new Error("external retrieval is blocked by the regression test");
  };

  try {
    for (const scenario of scenarios) {
      restoreEnvValue("NODE_ENV", scenario.nodeEnv);
      restoreEnvValue("DISABLE_EXTERNAL_FETCH", scenario.externalFetchFlag);
      delete env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH;

      const attemptsBefore = retrievalAttempts.length;
      await renderMarkdown("https://example.test/no-network");
      attemptsByScenario[scenario.name] =
        retrievalAttempts.length - attemptsBefore;
    }
  } finally {
    gotClient.get = originalGet;
    restoreEnvValue("NODE_ENV", originalNodeEnv);
    restoreEnvValue("DISABLE_EXTERNAL_FETCH", originalExternalFetchFlag);
    restoreEnvValue(
      "NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH",
      originalNextExternalFetchFlag,
    );
  }

  expect(attemptsByScenario).toEqual({
    "NODE_ENV=test": 0,
    "DISABLE_EXTERNAL_FETCH=1": 0,
  });
});
