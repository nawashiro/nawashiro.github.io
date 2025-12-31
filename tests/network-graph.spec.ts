import { test, expect } from "@playwright/test";
import { openNetworkPost } from "../components/network_graph";

test("openNetworkPost uses noopener and clears opener", () => {
  const calls: Array<{ url: string; target?: string; features?: string }> = [];
  const openedWindow = { opener: {} as unknown };
  const openFn = (url: string, target?: string, features?: string) => {
    calls.push({ url, target, features });
    return openedWindow as Window;
  };

  const result = openNetworkPost("sample-post", openFn);

  expect(result).toBe(true);
  expect(calls).toEqual([
    {
      url: "/posts/sample-post",
      target: "_blank",
      features: "noopener,noreferrer",
    },
  ]);
  expect(openedWindow.opener).toBeNull();
});
