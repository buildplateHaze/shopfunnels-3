import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const body = await request.json();
  console.log("📩 GDPR: Customer requested their data export", body);
  return json({ success: true });
}; 