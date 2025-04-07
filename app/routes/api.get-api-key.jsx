import { json } from "@remix-run/node";
import prisma from "../db.server"; // ✅ correct relative path

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server"); // ✅ dynamic import
  const { session } = await authenticate.admin(request);

  const record = await prisma.storeApiKey.findUnique({
    where: { shop: session.shop },
  });

  return json({ success: true, key: record?.key ?? null });
};
