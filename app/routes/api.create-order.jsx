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

  // First, get variant IDs for all items
  const variantIds = [];
  for (const item of items) {
    const query = `
      query getVariantBySku($sku: String!) {
        productVariants(first: 1, query: $sku) {
          nodes {
            id
            price
            currencyCode
          }
        }
      }
    `;

    const response = await fetch(`https://${shop}/admin/api/2025-04/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          sku: `sku:${item.sku}`
        }
      }),
    });

    const data = await response.json();
    const variant = data.data?.productVariants?.nodes[0];

    if (!variant) {
      console.warn(`⚠️ SKU not found: ${item.sku}`);
      continue;
    }

    variantIds.push({
      variantId: variant.id,
      quantity: item.quantity,
      price: variant.price,
      currencyCode: variant.currencyCode
    });
  }

  if (variantIds.length === 0) {
    return json({ success: false, error: "No valid variants found" });
  }

  // Create order using GraphQL mutation
  const mutation = `
    mutation orderCreate($order: OrderCreateOrderInput!) {
      orderCreate(order: $order) {
        order {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Prepare line items in the correct format
  const lineItems = variantIds.map(item => ({
    variantId: item.variantId,
    quantity: item.quantity,
    priceSet: {
      shopMoney: {
        amount: item.price,
        currencyCode: item.currencyCode
      }
    }
  }));

  // Prepare the order input as per Shopify's requirements
  const orderInput = {
    currency: "USD", // or dynamically set based on your store
    email: customerEmail,
    tags: ["shopfunnels"],
    lineItems,
    shippingAddress: shippingAddress,
    billingAddress: billingAddress,
    transactions: [
      {
        kind: "SALE",
        status: "SUCCESS",
        amountSet: {
          shopMoney: {
            amount: total,
            currencyCode: "USD" // or dynamically set
          }
        }
      }
    ]
  };

  const orderResponse = await fetch(`https://${shop}/admin/api/2025-04/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        order: orderInput
      }
    }),
  });

  const orderData = await orderResponse.json();

  if (orderData.errors || orderData.data?.orderCreate?.userErrors?.length > 0) {
    console.error("❌ Shopify error:", orderData.errors || orderData.data?.orderCreate?.userErrors);
    return json({ 
      success: false, 
      error: "Failed to create order", 
      details: orderData.errors || orderData.data?.orderCreate?.userErrors 
    });
  }

  console.log("✅ Shopify order created:", orderData.data?.orderCreate?.order?.id);
  return json({ success: true, shopifyOrderId: orderData.data?.orderCreate?.order?.id });
};
