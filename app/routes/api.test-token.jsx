import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getOfflineAccessToken } from "../utils/token.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const session = await admin.session;
  
  try {
    // Get offline token
    const offlineToken = await getOfflineAccessToken(session.shop);
    
    // Test the token with a simple GraphQL query
    const response = await fetch(`https://${session.shop}/admin/api/2025-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": offlineToken,
      },
      body: JSON.stringify({
        query: `{
          shop {
            name
            id
          }
        }`,
      }),
    });

    const data = await response.json();
    
    return json({
      success: true,
      shop: data.data?.shop,
      tokenStatus: "valid",
    });
  } catch (error) {
    return json({
      success: false,
      error: error.message,
      tokenStatus: "invalid",
    }, { status: 401 });
  }
}; 