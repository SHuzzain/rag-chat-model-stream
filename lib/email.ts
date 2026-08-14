import { Resend } from "resend";

import { envConfig } from "@/lib/env";

const apiKey = envConfig.RESEND_API_KEY ?? envConfig.RENDER_API_KEY;

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  if (!resend) {
    console.warn("[email] No Resend API key set; magic link:", url);
    return;
  }

  await resend.emails.send({
    from: "Chatbot Champs <noreply@chatbotchamps.dev>",
    to: email,
    subject: "Your sign-in link",
    html: `<p>Sign in to Chatbot Champs:</p><p><a href="${url}">${url}</a></p>`,
  });
}
