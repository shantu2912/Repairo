import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const payload = await req.json();

  const job = payload.record;
  if (job.status !== "pending") {
    return new Response("Ignored", { status: 200 });
  }

  const res = await fetch(
    "https://kzxdxnxgouthsywbsnvl.supabase.co/rest/v1/technician_devices",
    {
      headers: {
        apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`
      }
    }
  );

  const devices = await res.json();

  for (const d of devices) {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: `key=${Deno.env.get("FCM_SERVER_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: d.fcm_token,
        notification: {
          title: "🚨 New Job Available",
          body: `${job.category} - ${job.location}`
        }
      })
    });
  }

  return new Response("Sent", { status: 200 });
});
