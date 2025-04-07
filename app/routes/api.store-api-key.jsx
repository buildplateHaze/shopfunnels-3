import { json } from "@remix-run/node";
import prisma from "../../db.server";

export const action = async ({ request }) => {
  const body = await request.json();
  const { apiKey } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return json({ success: false, error: "Invalid API key" }, { status: 400 });
  }

  // Update your DB as needed – here's an example using Prisma:
  const shopify = (await import("../../shopify.server")).default;
  const { session } = await shopify.authenticate.admin(request);

  await prisma.storeApiKey.upsert({
    where: { shop: session.shop },
    update: { key: apiKey },
    create: { shop: session.shop, key: apiKey },
  });

  return json({ success: true });
};
