import { json } from "@remix-run/node";
import prisma from "../db.server"; // ✅ correct relative path

export const action = async ({ request }) => {
  const { authenticate } = await import("../shopify.server"); // ✅ dynamic import
  const { session } = await authenticate.admin(request);
  const body = await request.json();
  const { apiKey } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return json({ success: false, error: "Invalid API key" }, { status: 400 });
  }

  await prisma.storeApiKey.upsert({
    where: { shop: session.shop },
    update: { key: apiKey },
    create: { shop: session.shop, key: apiKey },
  });

  return json({ success: true });
};
