const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return json({ error: "Unsupported request format." }, 415);

  let data;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: "Your message is too long." }, 413);
    data = JSON.parse(raw);
  } catch {
    return json({ error: "Please check the form and try again." }, 400);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return json({ error: "Please check the form and try again." }, 400);
  if (String(data.company_website || "").trim()) return json({ ok: true });

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const service = String(data.service || "").trim();
  const message = String(data.message || "").trim();
  const kind = String(data.kind || "enquiry").trim().toLowerCase();
  if (!name || name.length > 120 || !email || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !service || service.length > 100 || !message || message.length > 5000 ||
      !["enquiry", "feedback"].includes(kind)) {
    return json({ error: "Please provide a valid name, email, selection and message." }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return json({ error: "Email delivery is not configured yet. Please email acsktech@gmail.com directly." }, 503);
  }

  const recipient = env.CONTACT_TO_EMAIL || "acsktech@gmail.com";
  const sender = env.CONTACT_FROM_EMAIL || "ACSKTech Website <website@acsktech.in>";
  const subject = kind === "feedback" ? `Website feedback: ${service}` : `Website enquiry: ${service}`;
  const body = [
    kind === "feedback" ? "New feedback from the ACSKTech website" : "New enquiry from the ACSKTech website",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Type: ${service}`,
    "",
    "Message:",
    message
  ].join("\n");

  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: sender, to: [recipient], reply_to: email, subject, text: body })
    });
  } catch {
    return json({ error: "Email delivery is temporarily unavailable. Please email acsktech@gmail.com directly." }, 502);
  }
  if (!response.ok) return json({ error: "We couldn't send your message right now. Please email acsktech@gmail.com directly." }, 502);
  return json({ ok: true });
}
