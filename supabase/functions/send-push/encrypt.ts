function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", key, salt.length ? salt : new Uint8Array(32)));

  const prkKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;
  const okm = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, infoWithCounter));
  return okm.slice(0, length);
}

function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);

  const info = new Uint8Array(
    18 + typeBytes.length + 1 + 5 + 2 + clientPublicKey.length + 2 + serverPublicKey.length
  );

  let offset = 0;
  const header = encoder.encode("Content-Encoding: ");
  info.set(header, offset);
  offset += header.length;
  info.set(typeBytes, offset);
  offset += typeBytes.length;
  info[offset++] = 0;

  const p256 = encoder.encode("P-256");
  info.set(p256, offset);
  offset += p256.length;

  info[offset++] = 0;
  info[offset++] = clientPublicKey.length;
  info.set(clientPublicKey, offset);
  offset += clientPublicKey.length;

  info[offset++] = 0;
  info[offset++] = serverPublicKey.length;
  info.set(serverPublicKey, offset);

  return info;
}

export async function encryptPayload(
  payload: string,
  p256dhBase64: string,
  authBase64: string
): Promise<{ body: Uint8Array; serverPublicKeyBase64: string; saltBase64: string }> {
  const clientPublicKey = base64UrlToUint8Array(p256dhBase64);
  const clientAuth = base64UrlToUint8Array(authBase64);

  const serverKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeys.publicKey)
  );

  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      serverKeys.privateKey,
      256
    )
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const prk = await hkdf(clientAuth, sharedSecret, authInfo, 32);

  const contentEncryptionKeyInfo = createInfo("aesgcm", clientPublicKey, serverPublicKeyRaw);
  const contentEncryptionKey = await hkdf(salt, prk, contentEncryptionKeyInfo, 16);

  const nonceInfo = createInfo("nonce", clientPublicKey, serverPublicKeyRaw);
  const nonce = await hkdf(salt, prk, nonceInfo, 12);

  const paddedPayload = new Uint8Array(2 + new TextEncoder().encode(payload).length);
  paddedPayload.set([0, 0]);
  paddedPayload.set(new TextEncoder().encode(payload), 2);

  const aesKey = await crypto.subtle.importKey(
    "raw",
    contentEncryptionKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      paddedPayload
    )
  );

  function toBase64Url(arr: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  return {
    body: encrypted,
    serverPublicKeyBase64: toBase64Url(serverPublicKeyRaw),
    saltBase64: toBase64Url(salt),
  };
}
