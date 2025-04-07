import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const body = await request.json();
  console.log("📩 GDPR: Shop requested data deletion", body);
  return json({ success: true });
}; 