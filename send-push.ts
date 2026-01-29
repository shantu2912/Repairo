import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { token, title, body } = await req.json();

  await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: "5f93e965e80495c18780728e0792286ea6213d53",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body }
    })
  });

  return new Response("ok");
});
