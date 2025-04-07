import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const shopify = (await import("../shopify.server")).default;

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) return json({ success: false, error: "Missing `shop` param" });

  const sessionId = `offline_${shop}`;
  const offlineSession = await shopify.sessionStorage.loadSession(sessionId);

  if (!offlineSession?.accessToken) {
    console.log("❌ No offline session found for", shop);
    return json({ success: false, error: "No offline session found" });
  }

  console.log("✅ Offline session loaded for", shop);
  return json({ success: true, shop, hasOfflineSession: true });
};
