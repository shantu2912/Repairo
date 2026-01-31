


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import admin from "npm:firebase-admin";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
       projectId: Deno.env.get("fixzen-73d68"),
      clientEmail: Deno.env.get("firebase-adminsdk-fbsvc@fixzen-73d68.iam.gserviceaccount.com"),
      privateKey: Deno.env.get("-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDelWhBRQX/TcwL\nmz7O4vV/hHmNm/Z8Ayw4/vqNEOKOen5oZTMyx0yawNM7+pNIzZmSiUKQbaKNZVJJ\nKwVd49jG643H7iqqPiMuc+MU3fTq7qbG/i9uSU/tQE29pqSpjpQFKbqLLL+NycZa\nxwswxUAFsdU2/YT+SuxJzVEGS4aSQ02uSNL3Yp9Bb9dIOu4EBUZxCWtpCpgVjsBH\nkqy6dSzMjqZoqT40LpeCVlw/4QwCssSE22MH58+kG0z8VNZv0X7tsZA92z5pwWsM\ncFM7Jw5PzY0549zEAox8P4LBYW7vv/nsoBMgd1EG0JUZ1RscKsTkR31PT6AhENV8\nlsgprA4rAgMBAAECggEACdXwVXIHYdC+Q4UIsXu1/XyNIoTRz4kUWzBpQfKNEF65\nV0Ohj4zfBbefnfbkq0Lqll8aYed2V2kyyajtA8kduyyNh1gu6nb0dwkH79QfDoKd\nPA3farAyp/k/djH29McoI1JEvAGuNUXFTh2dkPomahoBofxx9Aq7hkdcXTrZJ31c\nxwPeaKrC8PGKOqBvwxkD30EieobAjS3dpYWUDXFH5gfuQxAkqdLSjORUs+3wL5+7\naRATKvIiWNa0URbSG2s/DBc3RT84/oO1zu03cyTvOcnHQZA4y3BfYPKdaOwXYNTJ\njkiinP0ktxqRQv24L3lavUyXaQW4Es/bOA8yPnBQgQKBgQD0ob1qjj5lBVQEZxoG\ngMm6ILc1Uu/dpJQtmMMwZOCTiCryTG7Ac3FAF7GqyB5gM8e8ZWQR4c8HUq0YV9NM\n8uv2nwwLbD0eUzRsBOBfVZLQbu8S1AOIR7aYWIUdIs9nKkY6qtJXL5Km33zwI5hr\nPaebxrHbXnGbwwN9vE1nK51RfQKBgQDo7V8VRPjFOOJC8/yge2KIwQcYxKttt9ZB\nw72qvcWhG2NS9i5+SUVw5n/HXhGDAderaWmBrWg56WG6UX0C7N2JErCJX+T/wfrv\nPQpwVDgZN8ODS8G2ddQw1y0bDXchgIK6vhL1bssOMrR+/WYhRDXhzyV7Qb1jykHZ\nLEWjrTZuxwKBgD+Rf+0ehWwu1ERInmSuNr1dHv6GTLplt/OZTK9Yp1ru+Wn5HpZ3\n6SfkgFCGrA4HppF4L2bOLMQUYdJ/j/Lg9Rwi/DhDqiYlLOwc4EklrX7oNMvJuBlD\nuVkhN4X4s7h1Lca0+O+a9xrR3F9ygHrtjI5YNYNxqUf2hwO3WM3EcZ7pAoGAQnHM\nKN4W9POoH59IFmN8FTSzGI6ptE+3z+TNixI9eRq996GAW8f9BhrKoo2kAzIYWq5k\nSXi0/agkl6i9N4NoIrzxHQ783TRxp6NLAgYURqVQoXiP1sO/9vq6xDfQHv9wy2KD\nN/4V8IPoVz1jz+OMV1DnCUUUiI3ewNvPNcSofWsCgYEA0XRVF+Myr++bRFstvSvI\nq7K0cm+9YhlZplQj4oIJ3ZpBpOjpHZBaUwNwtLh5DRvecmQttOyYsY/UweAMmQii\nr772cHWd5iEyxhSSv0xUgpx9tFhhGBngeL8zOii+37jEPogdewAdI5vRZhhqDy2T\n3QAjQubayc5BszMsCRXEoYE=\n-----END PRIVATE KEY-----\n")?.replace(/\\n/g, "\n"),
    }),
  });
}

const supabase = createClient(
  Deno.env.get("https://kzxdxnxgouthsywbsnvl.supabase.co")!,
  Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag")!
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { job } = await req.json();

  if (!job) {
    return new Response("No job payload", { status: 400 });
  }

  // 🔥 FETCH TOKENS HERE (STEP 6C)
  const { data: techs, error } = await supabase
    .from("technicians")
    .select("fcm_token")
    .not("fcm_token", "is", null);

  if (error || !techs || techs.length === 0) {
    return new Response("No technician tokens", { status: 200 });
  }

  const tokens = techs.map(t => t.fcm_token);

  const message = {
    notification: {
      title: "🔧 New Job Available",
      body: `${job.category} - ${job.location}`,
    },
    data: {
      job_id: job.id,
    },
    tokens,
  };

  const res = await admin.messaging().sendEachForMulticast(message);

  return new Response(
    JSON.stringify({
      success: true,
      sent: res.successCount,
      failed: res.failureCount,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});

