import { webcrypto } from "node:crypto";

export const CHUNK_SIZE = 700;

export function splitPayload(base64, size = CHUNK_SIZE) {
  const chunks = [];
  for (let index = 0; index < base64.length; index += size) {
    chunks.push(base64.slice(index, index + size));
  }
  return chunks.length ? chunks : [""];
}

export async function sha256Hex(bytes) {
  const digest = await webcrypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function createPackets(fileName, mimeType, bytes, transferId = "test-transfer") {
  const checksum = await sha256Hex(bytes);
  const base64 = Buffer.from(bytes).toString("base64");
  const chunks = splitPayload(base64);
  return chunks.map((chunk, index) => ({
    transferId,
    fileName,
    mimeType,
    size: bytes.length,
    checksum,
    total: chunks.length,
    index,
    data: chunk
  }));
}

export async function assemblePackets(packets) {
  if (!packets.length) {
    throw new Error("no packets");
  }
  const first = packets[0];
  const byIndex = new Map(packets.map((packet) => [packet.index, packet]));
  for (let index = 0; index < first.total; index++) {
    if (!byIndex.has(index)) {
      throw new Error(`missing packet ${index}`);
    }
  }
  const base64 = Array.from({ length: first.total }, (_, index) => byIndex.get(index).data).join("");
  const bytes = Buffer.from(base64, "base64");
  const checksum = await sha256Hex(bytes);
  if (checksum !== first.checksum) {
    throw new Error("checksum mismatch");
  }
  return bytes;
}
