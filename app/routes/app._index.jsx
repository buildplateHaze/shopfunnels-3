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
  Banner,
  Divider,
  LegacyStack,
  Icon,
} from "@shopify/polaris";
import { CheckCircleIcon, AlertCircleIcon, InfoIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const webhookUrl = `https://shopfunnels-3.fly.dev/api/create-order?shop=${session.shop}`;
  return json({ webhookUrl });
};

export default function AppIndex() {
  const { webhookUrl } = useLoaderData();

  const sampleOrder = {
    id: "72",
    currency: "AED",
    customerEmail: "customer@example.com",
    items: [
      {
        sku: "YOUR-SKU-HERE",
        quantity: 1
      }
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      address2: "Apt 4B",
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      zipCode: "12345",
      phone: "+971501234567",
      companyName: "Example Company",
      companyId: "COMP123",
      vatId: "VAT123"
    },
    billingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      address2: "Apt 4B",
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      zipCode: "12345",
      phone: "+971501234567",
      companyName: "Example Company",
      companyId: "COMP123",
      vatId: "VAT123"
    },
    total: 100.00
  };

  return (
    <Page
      title="Integration Guide"
      subtitle="Connect your external app with Shopify"
    >
      <Layout>
        <Layout.Section>
          <Banner
            title="Integration Ready"
            icon={CheckCircleIcon}
            status="success"
          >
            <p>Your store is ready to receive orders from external applications.</p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Connect Your External App
              </Text>
              <Text as="p">
                Follow these steps to integrate your external application with Shopify:
              </Text>

              <ol style={{ paddingLeft: "1.5rem" }}>
                <li>
                  <Text as="p" variant="bodyMd">
                    Go to your external app settings or automation builder.
                  </Text>
                </li>
                <li>
                  <Text as="p" variant="bodyMd">
                    Find the place to configure a webhook or "HTTP Request".
                  </Text>
                </li>
                <li>
                  <Text as="p" variant="bodyMd">
                    Use the following URL as the destination:
                  </Text>
                  <Box paddingBlock="200" paddingInline="400" background="bg-surface-secondary">
                    <InlineCode>{webhookUrl}</InlineCode>
                  </Box>
                </li>
                <li>
                  <Text as="p" variant="bodyMd">
                    Set the request method to <strong>POST</strong> and the content type to{" "}
                    <InlineCode>application/json</InlineCode>.
                  </Text>
                </li>
              </ol>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Order Format
              </Text>
              <Text as="p">
                Send your orders in the following JSON format:
              </Text>
              <Box paddingBlock="200" paddingInline="400" background="bg-surface-secondary">
                <pre style={{ 
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {JSON.stringify(sampleOrder, null, 2)}
                </pre>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Testing Your Integration
              </Text>
              <Text as="p">
                You can test your integration using these tools:
              </Text>
              <LegacyStack distribution="fillEvenly">
                <Box padding="400">
                  <Link url="https://hoppscotch.io" external>
                    <img 
                      src="https://hoppscotch.io/icon.png" 
                      alt="Hoppscotch" 
                      style={{ width: '48px', height: '48px', marginBottom: '8px' }}
                    />
                    <Text as="p" variant="bodyMd">Hoppscotch</Text>
                  </Link>
                </Box>
                <Box padding="400">
                  <Link url="https://postman.com" external>
                    <img 
                      src="https://www.postman.com/_ar-assets/images/favicon-1-48.png" 
                      alt="Postman" 
                      style={{ width: '48px', height: '48px', marginBottom: '8px' }}
                    />
                    <Text as="p" variant="bodyMd">Postman</Text>
                  </Link>
                </Box>
              </LegacyStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Important Notes
              </Text>
              <LegacyStack vertical spacing="loose">
                <LegacyStack spacing="tight">
                  <Icon source={AlertCircleIcon} color="warning" />
                  <Text as="p" variant="bodyMd">
                    Make sure to replace <InlineCode>YOUR-SKU-HERE</InlineCode> with actual SKUs from your Shopify store.
                  </Text>
                </LegacyStack>
                <LegacyStack spacing="tight">
                  <Icon source={InfoIcon} color="info" />
                  <Text as="p" variant="bodyMd">
                    The currency should match your store's currency settings.
                  </Text>
                </LegacyStack>
                <LegacyStack spacing="tight">
                  <Icon source={InfoIcon} color="info" />
                  <Text as="p" variant="bodyMd">
                    All address fields are required for proper order processing.
                  </Text>
                </LegacyStack>
              </LegacyStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Need Help?
              </Text>
              <Text as="p">
                If you need assistance with the integration, please contact our support team.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
