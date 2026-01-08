import { test, expect } from "@playwright/test";
import { shouldEnableExternalFetch } from "../lib/posts";
import { shouldFetchWebmentions } from "../components/WebMention";

const env = process.env as Record<string, string | undefined>;

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
    expect(shouldFetchWebmentions()).toBe(false);
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
    expect(shouldFetchWebmentions()).toBe(false);
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
    expect(shouldFetchWebmentions()).toBe(true);
  } finally {
    restoreEnvValue("NODE_ENV", originalNodeEnv);
    restoreEnvValue("NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH", originalFlag);
  }
});
