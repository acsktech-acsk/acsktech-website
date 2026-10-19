const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer"
  }
});

const allowedServices = new Set([
  "Salesforce Consulting", "Implementation & Configuration",
  "Customization & Development", "Integration", "Data & Analytics",
  "Training", "Support & Managed Services", "Other",
  "Excellent", "Good", "Average", "Needs improvement"
]);

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (origin && !["https://acsktech.in", "https://www.acsktech.in"].includes(origin)) {
    return json({ error: "Request origin is not allowed." }, 403);
  }
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ error: "Unsupported request format." }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 12000) return json({ error: "Your message is too long." }, 413);

  let data;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 12000) return json({ error: "Your message is too long." }, 413);
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

  if (!name || name.length > 120 || /[\r\n\u0000-\u001f]/.test(name) ||
      !email || email.length > 254 || /[\r\n\u0000-\u001f]/.test(email) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !allowedServices.has(service) || !message || message.length > 5000 ||
      !["enquiry", "feedback"].includes(kind)) {
    return json({ error: "Please provide a valid name, email, selection and message." }, 400);
  }
  const turnstileToken = String(data["cf-turnstile-response"] || "").trim();
  if (!env.TURNSTILE_SECRET) return json({ error: "Form verification is not configured yet. Please email acsktech@gmail.com directly." }, 503);
  if (!turnstileToken || turnstileToken.length > 2048) {
    return json({ error: "Please complete the security check and try again." }, 400);
  }

  let verification;
  try {
    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: turnstileToken,
        ...(request.headers.get("CF-Connecting-IP") ? { remoteip: request.headers.get("CF-Connecting-IP") } : {})
      })
    });
    if (!verifyResponse.ok) throw new Error("Turnstile verification request failed");
    verification = await verifyResponse.json();
  } catch {
    return json({ error: "The security check is temporarily unavailable. Please try again shortly." }, 502);
  }

  if (verification.success !== true || !["acsktech.in", "www.acsktech.in"].includes(String(verification.hostname || "").toLowerCase())) {
    return json({ error: "Security verification failed. Please refresh the security check and try again." }, 403);
  }

  if (!env.RESEND_API_KEY) return json({ error: "Email delivery is not configured yet. Please email acsktech@gmail.com directly." }, 503);

  const recipient = env.CONTACT_TO_EMAIL || "acsktech@gmail.com";
  const sender = env.CONTACT_FROM_EMAIL || "ACSKTech Website <website@acsktech.in>";
  const subject = kind === "feedback" ? `Website feedback: ${service}` : `Website enquiry: ${service}`;
  const body = [
    kind === "feedback" ? "New feedback from the ACSKTech website" : "New enquiry from the ACSKTech website",
    "", `Name: ${name}`, `Email: ${email}`, `Type: ${service}`, "", "Message:", message
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
