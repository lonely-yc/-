import { describe, expect, it } from "vitest";
import { paginate } from "./pagination";

describe("paginate", () => {
  it("returns current page items and display range", () => {
    const result = paginate([1, 2, 3, 4, 5], 2, 2);

    expect(result.pageItems).toEqual([3, 4]);
    expect(result).toMatchObject({ page: 2, totalPages: 3, start: 3, end: 4 });
  });

  it("clamps page to the last available page", () => {
    const result = paginate(["a", "b", "c"], 9, 2);

    expect(result.page).toBe(2);
    expect(result.pageItems).toEqual(["c"]);
  });

  it("handles empty lists with a stable single page", () => {
    const result = paginate([], 1, 10);

    expect(result).toMatchObject({ pageItems: [], total: 0, totalPages: 1, start: 0, end: 0 });
  });
});
