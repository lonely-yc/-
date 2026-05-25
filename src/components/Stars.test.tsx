import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Stars } from "./Stars";

describe("Stars", () => {
  it("renders five Chinese star glyphs with an accessible rating label", () => {
    const markup = renderToStaticMarkup(<Stars rating={3} />);

    expect(markup).toContain('aria-label="3 星"');
    expect(markup.match(/★/g)).toHaveLength(3);
    expect(markup.match(/☆/g)).toHaveLength(2);
  });
});
