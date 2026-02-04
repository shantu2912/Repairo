import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  try {
    const payload = await req.json();
    const job = payload.record;

    // Safety check
    if (!job || job.status !== "pending") {
      return new Response("Ignored", { status: 200 });
    }

    const sb = createClient(
      SUPABASE_URL,
      SERVICE_ROLE_KEY
    );

    // Fetch all active technicians
    const { data: techs, error } = await sb
      .from("technicians")
      .select("email,name")
      .eq("active", true);

    if (error || !techs || techs.length === 0) {
      console.error("No technicians", error);
      return new Response("No techs", { status: 200 });
    }

    const recipients = techs.map(t => t.email);

    const body = `
🚨 NEW JOB AVAILABLE

Category: ${job.category}
Device: ${job.device}
Issue: ${job.issue}
Location: ${job.location}

Login now to FixZen and accept the job.
First come = first assigned.
`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "FixZen Jobs <jobs@fixzen.com>",
        to: recipients,
        subject: "🔧 New Job Available – FixZen",
        text: body
      })
    });

    if (!res.ok) {
      console.error(await res.text());
      return new Response("Email failed", { status: 500 });
    }

    return new Response("Emails sent", { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response("Error", { status: 500 });
  }
});
