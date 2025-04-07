import { useState } from "react";
import {
  Page,
  Layout,
  TextField,
  Button,
  Card,
  Text,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function AdditionalSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState(null);

  const saveApiKey = async () => {
    try {
      const response = await fetch("/api/store-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("✅ API key saved successfully.");
      } else {
        setStatus(`❌ Error: ${result.error || "Something went wrong"}`);
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to save API key.");
    }
  };

  return (
    <Page>
      <TitleBar title="External App Settings" />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              Connect External System
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Enter your external app's API key to allow secure order syncing.
            </Text>
            <InlineStack gap="400" align="start" blockAlign="center" wrap={false}>
              <TextField
                label="API Key"
                value={apiKey}
                onChange={setApiKey}
                autoComplete="off"
                helpText="This key is provided by your external system."
              />
              <Button onClick={saveApiKey} primary>
                Save
              </Button>
            </InlineStack>
            {status && (
              <Text tone={status.startsWith("✅") ? "success" : "critical"}>
                {status}
              </Text>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
