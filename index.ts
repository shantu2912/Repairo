import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import admin from "npm:firebase-admin";

const serviceAccount = JSON.parse(
  Deno.env.get("FCM_SERVICE_ACCOUNT")!
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { token, title, body, data } = await req.json();

  if (!token || !title || !body) {
    return new Response(
      JSON.stringify({ error: "Missing fields" }),
      { status: 400 }
    );
  }

  await admin.messaging().send({
    token,
    notification: { title, body },
    data: data || {},
  });

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
});
