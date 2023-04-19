import { AlphaCard, Page, Label, Layout, Text} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function PageName() {
  return (
    <Page>
      <TitleBar
        title="Page name"
        primaryAction={{
          content: "Primary action",
          onAction: () => console.log("Primary action"),
        }}
        secondaryActions={[
          {
            content: "Secondary action",
            onAction: () => console.log("Secondary action"),
          },
        ]}
      />
      <Layout>
        <Layout.Section>
          <AlphaCard>
            <Label>Heading</Label>
            <Text>Body</Text>
          </AlphaCard>
          <AlphaCard>
            <Label>Heading</Label>
            <Text>Body</Text>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section secondary>
          <AlphaCard>
            <Label>Heading</Label>
            <Text>Body</Text>
          </AlphaCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
