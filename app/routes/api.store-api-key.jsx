import { json } from "@remix-run/node";
import prisma from "../db.server";
import shopify from "../shopify.server";

export const action = async ({ request }) => {
  const body = await request.json();
  const { apiKey } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return json({ success: false, error: "Invalid API key" }, { status: 400 });
  }

  // Get the authenticated admin session
  const { session } = await shopify.authenticate.admin(request);

  // Store or update the API key associated with the shop
  await prisma.storeApiKey.upsert({
    where: { shop: session.shop },
    update: { key: apiKey },
    create: { shop: session.shop, key: apiKey },
  });

  return json({ success: true });
};
