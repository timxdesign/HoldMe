import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "./webpush.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const authHeader = req.headers.get("authorization");
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const record = body.record || body;

    const userId = record.user_id;
    const title = record.title;
    const notifBody = record.body;
    const type = record.type;
    const data = record.data;

    if (!userId || !title) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscriptions" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vapidKeys = {
      publicKey: Deno.env.get("VAPID_PUBLIC_KEY")!,
      privateKey: Deno.env.get("VAPID_PRIVATE_KEY")!,
      subject: Deno.env.get("VAPID_SUBJECT") || "mailto:hello@holdme.app",
    };

    let url = "/notifications";
    if (type === "strength") url = "/notifications";
    if (type === "reminder" && data?.item_id) url = "/notifications";
    if (type === "comment" && data?.space_id && data?.item_id) {
      url = `/spaces/${data.space_id}/goals/${data.item_id}`;
    }

    let tag: string | undefined;
    if (type === "reminder") tag = `reminder-${data?.item_id}`;
    if (type === "comment") tag = `comment-${data?.item_id}`;

    const payload = {
      title,
      body: notifBody,
      tag,
      data: { url, type },
    };

    const results = await Promise.all(
      subscriptions.map((sub) => sendWebPush(sub, payload, vapidKeys))
    );

    const gone = results.filter((r) => r.gone);
    if (gone.length > 0) {
      const goneIds = gone.map((r) => r.subscriptionId);
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", goneIds);
    }

    const sent = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({ sent, failed: results.length - sent, cleaned: gone.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
