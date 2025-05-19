import { json } from "@remix-run/node";
import shopify from "../shopify.server";
import prisma from "../db.server";
import { logOrderDetails, logOrderStatus } from "../utils/orderLogger";

// Helper function to format address according to Shopify's MailingAddressInput
function formatAddress(address) {
  if (!address) return null;
  
  return {
    firstName: address.name?.split(' ')[0] || '',
    lastName: address.name?.split(' ').slice(1).join(' ') || '',
    address1: address.address || '',
    address2: address.address2 || '',
    city: address.city || '',
    province: address.state || '',
    country: address.country || '',
    zip: address.zipCode || '',
    phone: address.phone || '',
    company: address.companyName || ''
  };
}

export const action = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    logOrderStatus("ERROR", "Missing shop parameter");
    return json({ success: false, error: "Missing `shop` param" });
  }

  const sessionId = `offline_${shop}`;
  const session = await shopify.sessionStorage.loadSession(sessionId);

  if (!session?.accessToken) {
    logOrderStatus("ERROR", "No offline session found");
    return json({ success: false, error: "No offline session found" });
  }

  const body = await request.json();

  // Log the incoming order details
  logOrderDetails(body, "external");

  // 📝 Log order to database
  await prisma.orderLog.create({
    data: {
      shop,
      raw: JSON.stringify(body, null, 2),
    },
  });

  const { customerEmail, items, shippingAddress, billingAddress, total } = body;

  // First, get variant IDs for all items and fetch shop currency code
  let shopCurrency = "USD";
  const variantIds = [];
  for (const [index, item] of items.entries()) {
    const query = `
      query getVariantBySku($sku: String!) {
        productVariants(first: 1, query: $sku) {
          nodes {
            id
            price
            sku
            product {
              title
            }
          }
        }
        shop {
          currencyCode
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
    if (index === 0 && data.data?.shop?.currencyCode) {
      shopCurrency = data.data.shop.currencyCode;
    }
    if (!variant) {
      logOrderStatus("WARNING", `SKU not found: ${item.sku}`);
      continue;
    }
    variantIds.push({
      variantId: variant.id,
      quantity: item.quantity,
      price: variant.price
    });
  }

  if (variantIds.length === 0) {
    logOrderStatus("ERROR", "No valid variants found");
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
        currencyCode: shopCurrency
      }
    }
  }));

  // Format addresses according to Shopify's requirements
  const formattedShippingAddress = formatAddress(shippingAddress);
  const formattedBillingAddress = formatAddress(billingAddress);

  // Prepare the order input as per Shopify's requirements
  const orderInput = {
    currency: shopCurrency,
    email: customerEmail,
    tags: ["shopfunnels"],
    lineItems,
    shippingAddress: formattedShippingAddress,
    billingAddress: formattedBillingAddress,
    transactions: [
      {
        kind: "SALE",
        status: "SUCCESS",
        amountSet: {
          shopMoney: {
            amount: total,
            currencyCode: shopCurrency
          }
        }
      }
    ]
  };

  logOrderStatus("PROCESSING", "Creating order in Shopify");

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
    logOrderStatus("ERROR", "Failed to create order in Shopify", orderData.errors || orderData.data?.orderCreate?.userErrors);
    return json({ 
      success: false, 
      error: "Failed to create order", 
      details: orderData.errors || orderData.data?.orderCreate?.userErrors 
    });
  }

  const shopifyOrderId = orderData.data?.orderCreate?.order?.id;
  logOrderStatus("SUCCESS", `Order created successfully in Shopify with ID: ${shopifyOrderId}`);
  return json({ success: true, shopifyOrderId });
};
