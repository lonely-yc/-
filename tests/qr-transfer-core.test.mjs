import { describe, expect, it } from "vitest";
import { assemblePackets, createPackets } from "../scripts/qr-transfer-core.mjs";

describe("qr transfer core", () => {
  it("reassembles packets in any order", async () => {
    const source = new TextEncoder().encode("项目履历平台离线码传测试");
    const packets = await createPackets("demo.txt", "text/plain", source);

    const restored = await assemblePackets([...packets].reverse());

    expect(new TextDecoder().decode(restored)).toBe("项目履历平台离线码传测试");
  });

  it("detects missing packets", async () => {
    const source = new Uint8Array(1800).fill(7);
    const packets = await createPackets("demo.bin", "application/octet-stream", source);

    await expect(assemblePackets(packets.slice(1))).rejects.toThrow("missing packet 0");
  });
});
