export function decodeDataUrl(dataUrl: string): Uint8Array {
  const [header = "", encodedPayload = ""] = dataUrl.split(",", 2);
  const isBase64 = header.includes(";base64");
  const buffer = isBase64
    ? Buffer.from(encodedPayload, "base64")
    : Buffer.from(decodeURIComponent(encodedPayload), "utf8");

  return new Uint8Array(buffer);
}
