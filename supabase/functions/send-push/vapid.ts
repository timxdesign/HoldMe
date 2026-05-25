function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function createVapidHeaders(
  endpoint: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<{ authorization: string; cryptoKeyHeader: string }> {
  const audience = new URL(endpoint).origin;

  const header = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))
  );

  const now = Math.floor(Date.now() / 1000);
  const payload = uint8ArrayToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({ aud: audience, exp: now + 12 * 3600, sub: subject })
    )
  );

  const unsignedToken = `${header}.${payload}`;

  const privateKeyBytes = base64UrlToUint8Array(privateKey);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    convertRawPrivateKeyToPKCS8(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const sig = uint8ArrayToBase64Url(new Uint8Array(convertDERtoRaw(signature)));

  return {
    authorization: `vapid t=${unsignedToken}.${sig}, k=${publicKey}`,
    cryptoKeyHeader: `p256ecdsa=${publicKey}`,
  };
}

function convertRawPrivateKeyToPKCS8(raw: Uint8Array): ArrayBuffer {
  const pkcs8Header = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48,
    0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03,
    0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const result = new Uint8Array(pkcs8Header.length + raw.length);
  result.set(pkcs8Header);
  result.set(raw, pkcs8Header.length);
  return result.buffer;
}

function convertDERtoRaw(signature: ArrayBuffer): ArrayBuffer {
  const sig = new Uint8Array(signature);
  // If already 64 bytes, it's raw format
  if (sig.length === 64) return signature;

  // Parse DER format
  const raw = new Uint8Array(64);
  let offset = 2;
  const rLen = sig[offset + 1];
  offset += 2;
  const rStart = rLen === 33 ? offset + 1 : offset;
  raw.set(sig.slice(rStart, rStart + 32), 0);

  offset += rLen;
  const sLen = sig[offset + 1];
  offset += 2;
  const sStart = sLen === 33 ? offset + 1 : offset;
  raw.set(sig.slice(sStart, sStart + 32), 32);

  return raw.buffer;
}
