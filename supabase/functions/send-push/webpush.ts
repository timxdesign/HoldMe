import { createVapidHeaders } from "./vapid.ts";
import { encryptPayload } from "./encrypt.ts";

interface Subscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

interface PushResult {
  subscriptionId: string;
  success: boolean;
  status: number;
  gone: boolean;
}

export async function sendWebPush(
  subscription: Subscription,
  payload: object,
  vapidKeys: VapidKeys
): Promise<PushResult> {
  try {
    const { authorization, cryptoKeyHeader } = await createVapidHeaders(
      subscription.endpoint,
      vapidKeys.subject,
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    const { body, serverPublicKeyBase64, saltBase64 } = await encryptPayload(
      JSON.stringify(payload),
      subscription.p256dh,
      subscription.auth
    );

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Crypto-Key": `${cryptoKeyHeader};dh=${serverPublicKeyBase64}`,
        "Content-Encoding": "aesgcm",
        Encryption: `salt=${saltBase64}`,
        "Content-Type": "application/octet-stream",
        TTL: "86400",
      },
      body: body,
    });

    const gone = response.status === 404 || response.status === 410;

    return {
      subscriptionId: subscription.id,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      gone,
    };
  } catch {
    return {
      subscriptionId: subscription.id,
      success: false,
      status: 0,
      gone: false,
    };
  }
}
