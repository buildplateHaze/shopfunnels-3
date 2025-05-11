import prisma from "../db.server";

export async function getOfflineAccessToken(shop) {
  try {
    const sessionId = `offline_${shop}`;
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session?.accessToken) {
      throw new Error("No offline access token found");
    }

    return session.accessToken;
  } catch (error) {
    console.error("Error getting offline access token:", error);
    throw error;
  }
}

export async function storeOfflineAccessToken(session) {
  try {
    const sessionId = `offline_${session.shop}`;
    const offlineSession = {
      ...session,
      id: sessionId,
      isOnline: false,
    };

    await prisma.session.upsert({
      where: { id: sessionId },
      update: offlineSession,
      create: offlineSession,
    });

    console.log("✅ Stored offline access token for", session.shop);
  } catch (error) {
    console.error("Error storing offline access token:", error);
    throw error;
  }
} 