import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
    AlphaCard,
    EmptyState,
    Layout,
    Page,
    SkeletonBodyText,
} from "@shopify/polaris";
import { useAppQuery } from "../hooks";
import {IntegrationsIndex} from "../components";

export default function IntegrationsPage() {

    const navigate = useNavigate();

    const {
        data: Integrations,
        isLoading,
        isRefetching,
    } = useAppQuery({
        url: "/api/integrations",
    });

    const loadingMarkup = isLoading ? (
        <AlphaCard>
            <Loading />
            <SkeletonBodyText />
        </AlphaCard>
    ) : null;
    
    const integrationsMarkup = Integrations?.integrations.length ? (
        <IntegrationsIndex Integrations={Integrations.integrations} loading={isRefetching}  />
    ) : null;

    const emptyStateMarkup = !isLoading && !Integrations?.integrations.length ? (
        <AlphaCard>
            <EmptyState
                heading="Create a unique Integration"
                /* This button will take the user to a Create an Integration page */
                action={{
                    content: "Create Integration",
                    onAction: () => navigate(`/integrations/new`),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>
                    Setup Integrations for order packing.
                </p>
            </EmptyState>
        </AlphaCard>
    ) : null;

  return (
    <Page fullWidth={!!integrationsMarkup}>
       <TitleBar
          title="Integrations"
          primaryAction={{
              content: "Create Integration",
              onAction: () => navigate(`/integrations/new`),
          }}
      />
      <Layout>
          <Layout.Section>
              {loadingMarkup}
              {integrationsMarkup}
              {emptyStateMarkup}
          </Layout.Section>
      </Layout>
    </Page>
  );



}