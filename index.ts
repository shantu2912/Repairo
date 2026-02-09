import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle Browser Security
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, message } = await req.json();
    const token = Deno.env.get("WHATSAPP_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ''), // Formats number correctly
          type: "text",
          text: { body: message }
        })
      }
    );

    const data = await res.json();
    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});