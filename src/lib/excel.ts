import * as XLSX from "xlsx";
import type { RawWorkRow } from "../types";
import { normalizeRows } from "./normalize";

export async function parseExcelFile(file: File) {
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
    throw new Error("仅支持 xlsx 或 xls 文件");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Excel 文件中没有工作表");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RawWorkRow>(sheet, { defval: "" });
  return normalizeRows(rows);
}
