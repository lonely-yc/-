import { describe, expect, it } from "vitest";
import { safeDownloadUrl } from "../scripts/download-url-core.mjs";

describe("safeDownloadUrl", () => {
  it("encodes a partially encoded Windows path so Tomcat can parse the request", () => {
    const url = "/api/files/download?path=E:\\HTML\\AI%E8%B5%8B%E8%83%BD\\backend\\uploads\\masked\\新建 DOCX 文档_脱敏版.docx";

    const safe = safeDownloadUrl(url);
    const target = safe.slice(safe.indexOf("?path=") + "?path=".length);

    expect(target).not.toContain("\\");
    expect(target).not.toContain(":");
    expect(target).toContain("%5C");
    expect(target).toContain("%3A");
  });

  it("preserves spaces from backend form-style plus encoding", () => {
    const url = "/api/files/download?path=E%3A%5CHTML%5Cbackend%5Cuploads%5C新建+DOCX+文档_脱敏版.docx";

    const safe = safeDownloadUrl(url);

    expect(safe).toContain("%E6%96%B0%E5%BB%BA%20DOCX%20%E6%96%87%E6%A1%A3_%E8%84%B1%E6%95%8F%E7%89%88.docx");
    expect(safe).not.toContain("%2BDOCX%2B");
  });
});
