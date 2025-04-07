import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Box,
  InlineStack,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const logs = await prisma.orderLog.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return json({ logs });
};

export default function AppIndex() {
  const { logs } = useLoaderData();

  return (
    <Page title="Order Logs">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Latest Orders Received</Text>
              {logs.length === 0 ? (
                <Text>No orders received yet.</Text>
              ) : (
                logs.map((log, index) => (
                  <Box
                    key={index}
                    padding="300"
                    borderWidth="025"
                    borderRadius="200"
                    background="bg-surface-active"
                    borderColor="border"
                    overflowX="auto"
                  >
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {log.raw}
                    </pre>
                  </Box>
                ))
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
