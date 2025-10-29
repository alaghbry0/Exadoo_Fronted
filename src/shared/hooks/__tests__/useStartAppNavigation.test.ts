import { describe, expect, it, afterEach } from "vitest";
import {
  extractStartAppFromSearch,
  readStartAppParam,
  resolveTargetRoute,
} from "../useStartAppNavigation";

describe("extractStartAppFromSearch", () => {
  it("returns the startapp query when present", () => {
    expect(extractStartAppFromSearch("?startapp=plans")).toBe("plans");
  });

  it("supports telegram start param aliases", () => {
    expect(extractStartAppFromSearch("?tgWebAppStartParam=profile")).toBe(
      "profile",
    );
    expect(extractStartAppFromSearch("?start_param=notifications")).toBe(
      "notifications",
    );
  });

  it("returns null when no parameter exists", () => {
    expect(extractStartAppFromSearch("?")).toBeNull();
  });
});

describe("resolveTargetRoute", () => {
  it("maps known aliases to app routes", () => {
    expect(resolveTargetRoute("shop")).toBe("/shop");
    expect(resolveTargetRoute("notifications")).toBe("/notifications");
  });

  it("decodes explicit route directives", () => {
    expect(resolveTargetRoute("route:%2Fplans%3Ffoo%3Dbar")).toBe(
      "/plans?foo=bar",
    );
  });

  it("returns null for unknown values", () => {
    expect(resolveTargetRoute("unknown" as string)).toBeNull();
  });
});

describe("readStartAppParam", () => {
  const originalTelegram = (globalThis as any).Telegram;

  afterEach(() => {
    (globalThis as any).Telegram = originalTelegram;
  });

  it("prefers telegram init data when available", () => {
    (globalThis as any).Telegram = {
      WebApp: {
        initDataUnsafe: {
          start_param: "profile",
        },
      },
    };

    expect(readStartAppParam()).toBe("profile");
  });
});
