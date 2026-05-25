export function safeDownloadUrl(downloadUrl) {
  const marker = "?path=";
  const markerIndex = String(downloadUrl || "").indexOf(marker);
  if (markerIndex < 0) {
    return downloadUrl;
  }

  const base = downloadUrl.slice(0, markerIndex + marker.length);
  const rawPath = downloadUrl.slice(markerIndex + marker.length).replace(/\+/g, "%20");
  let decodedPath = rawPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    decodedPath = rawPath;
  }
  return base + encodeURIComponent(decodedPath);
}
