import sendEmail from "@/lib/nodemailer";
import sanitizeHtml from "sanitize-html";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const safeName = sanitizeHtml(String(name || "").trim(), { allowedTags: [], allowedAttributes: {} });
    const safeMessage = sanitizeHtml(String(message || "").trim(), { allowedTags: [], allowedAttributes: {} });
    const safeCategory = sanitizeHtml(String(category || "General").trim(), { allowedTags: [], allowedAttributes: {} });

    const text = `Name: ${safeName}\nEmail: ${String(email)}\nCategory: ${safeCategory}\n\nMessage:\n${safeMessage}`;
    const html = `
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${String(email)}</p>
      <p><strong>Category:</strong> ${safeCategory}</p>
      <hr/>
      <p>${safeMessage.replace(/\n/g, "<br/>")}</p>
    `;

    try {
      await sendEmail({
        to: "teamxceylon@gmail.com",
        replyTo: String(email),
        subject: `Contact form: ${safeCategory} — ${safeName}`,
        text,
        html,
      });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
      console.error("/api/contact sendEmail error:", err);
      if (process.env.NODE_ENV !== "production") {
        console.warn("sendEmail failed in dev — returning success with dev flag");
        return new Response(JSON.stringify({ success: true, dev: true, error: String(err) }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
    }
  } catch (err) {
    console.error("/api/contact error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
  }
}
