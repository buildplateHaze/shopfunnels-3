import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const body = await request.json();

  console.log("🔍 Incoming payload from external app:");
  console.dir(body, { depth: null });

  return json({ success: true, received: body });
};
