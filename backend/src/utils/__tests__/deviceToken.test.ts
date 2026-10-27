import { describe, it, expect } from "vitest";
import { generateDeviceToken, hashDeviceToken, verifyDeviceToken, safeEqualHex } from "../deviceToken";

describe("device tokens", () => {
  it("generates a non-empty, sufficiently long token", () => {
    const t = generateDeviceToken();
    expect(typeof t).toBe("string");
    expect(t.length).toBeGreaterThanOrEqual(32);
  });

  it("hashes deterministically and verifies", () => {
    const token = generateDeviceToken();
    const hash = hashDeviceToken(token);
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(token);
    expect(verifyDeviceToken(token, hash)).toBe(true);
  });

  it("rejects a wrong token", () => {
    const token = generateDeviceToken();
    const hash = hashDeviceToken(token);
    expect(verifyDeviceToken("wrong-token", hash)).toBe(false);
  });

  it("rejects empty inputs", () => {
    expect(() => hashDeviceToken("")).toThrow();
    expect(verifyDeviceToken("", "deadbeef")).toBe(false);
    expect(verifyDeviceToken("abc", "")).toBe(false);
  });

  it("safeEqualHex handles mismatched lengths", () => {
    expect(safeEqualHex("aa", "aaaa")).toBe(false);
  });

  it("produces different hashes for different tokens", () => {
    const a = hashDeviceToken("token-a");
    const b = hashDeviceToken("token-b");
    expect(a).not.toBe(b);
  });
});
