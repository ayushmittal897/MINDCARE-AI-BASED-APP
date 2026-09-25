import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("contracts", () => {
  it("parses login body", () => {
    const s = z.object({ email: z.string().email(), password: z.string().min(6) });
    expect(s.safeParse({ email: "a@b.co", password: "secret12" }).success).toBe(true);
  });
});
