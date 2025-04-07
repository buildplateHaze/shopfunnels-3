import { json } from "@remix-run/node";
import shopify from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) return json({ success: false, error: "Missing `shop` param" });

  const sessionId = `offline_${shop}`;
  const session = await shopify.sessionStorage.loadSession(sessionId);

  if (!session?.accessToken) {
    return json({ success: false, error: "No offline session found" });
  }

  const body = await request.json();

  // 📝 Log order to database
  await prisma.orderLog.create({
    data: {
      shop,
      raw: JSON.stringify(body, null, 2),
    },
  });

  console.log("🟢 Received external order:", body);

  const { customerEmail, items, shippingAddress, billingAddress, total } = body;

  const variantIds = [];
  for (const item of items) {
    const res = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    const variant = data.products
      .flatMap((product) => product.variants)
      .find((v) => v.sku === item.sku);

    if (!variant) {
      console.warn(`⚠️ SKU not found: ${item.sku}`);
      continue;
    }

    variantIds.push({ variant_id: variant.id, quantity: item.quantity });
  }

  if (variantIds.length === 0) {
    return json({ success: false, error: "No valid variants found" });
  }

  const orderPayload = {
    order: {
      email: customerEmail,
      tags: "shopfunnels", // ✅ Add the tag here      
      line_items: variantIds,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      financial_status: "paid",
      transactions: [
        {
          kind: "sale",
          status: "success",
          amount: total,
        },
      ],
    },
  };

  const orderRes = await fetch(`https://${shop}/admin/api/2023-10/orders.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });

  const orderData = await orderRes.json();

  if (!orderRes.ok) {
    console.error("❌ Shopify error:", orderData);
    return json({ success: false, error: "Failed to create order", details: orderData });
  }

  console.log("✅ Shopify order created:", orderData.order?.id);
  return json({ success: true, shopifyOrderId: orderData.order?.id });
};
