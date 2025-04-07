import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  try {
    const payload = await request.json();

    console.log("🟢 Order received from external app:", payload);

    // Optional: validate structure here if needed
    if (!payload || !Array.isArray(payload.items)) {
      return json({ success: false, error: "Invalid order format" }, { status: 400 });
    }

    return json({
      success: true,
      message: "Order received successfully",
      received: payload,
    });
  } catch (error) {
    console.error("❌ Failed to parse external order:", error);
    return json({ success: false, error: "Invalid JSON or unexpected error" }, { status: 500 });
  }
};