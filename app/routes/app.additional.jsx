import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Box,
  Link,
  InlineCode,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const webhookUrl = `https://shopfunnels-3.fly.dev/api/create-order?shop=${session.shop}`;
  return json({ webhookUrl });
};

export default function AdditionalPage() {
  const { webhookUrl } = useLoaderData();

  return (
    <Page title="How to Integrate">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Connect Your External App
              </Text>
              <Text as="p">
                To start sending orders from your external app to Shopify, follow these steps:
              </Text>

              <ol style={{ paddingLeft: "1.5rem" }}>
                <li>
                  Go to your external app settings or automation builder.
                </li>
                <li>
                  Find the place to configure a webhook or "HTTP Request".
                </li>
                <li>
                  Use the following URL as the destination:
                  <Box paddingBlock="200">
                    <InlineCode>{webhookUrl}</InlineCode>
                  </Box>
                </li>
                <li>
                  Set the request method to <strong>POST</strong> and the content type to{" "}
                  <InlineCode>application/json</InlineCode>.
                </li>
                <li>
                  Make sure to send the full order data in the body. If you need a sample format,
                  contact us.
                </li>
              </ol>

              <Text as="p" variant="bodySm">
                If you're testing, use a tool like{" "}
                <Link url="https://hoppscotch.io" external>
                  Hoppscotch
                </Link>{" "}
                or{" "}
                <Link url="https://postman.com" external>
                  Postman
                </Link>{" "}
                to simulate the request.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
