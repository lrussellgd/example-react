import { useParams } from "react-router-dom";
import { AlphaCard, Page, Label, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery } from "../../hooks";
import { IntegrationForm } from "../../components";

export default function IntegrationEdit() {
    const { id } = useParams();

    /*
      Fetch the Integration.
      useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
      The backend supplements app data with data queried from the Shopify GraphQL Admin API.
    */
    const {
        data: Integration,
        isLoading,
        isRefetching,
    } = useAppQuery({
        url: `/api/integrations/${id}`,
        reactQueryOptions: {
            /* Disable refetching because the QRCodeForm component ignores changes to its props */
            refetchOnReconnect: false,
        },
    });

    const breadcrumbs = [{ content: "Integrations", url: "/" }];

    /* Loading action and markup that uses App Bridge and Polaris components */
    if (isLoading || isRefetching) {
        return (
            <Page>
                <TitleBar
                    title="Edit Integration"
                    breadcrumbs={breadcrumbs}
                    primaryAction={null}
                />
                <Loading />
                <Layout>
                    <Layout.Section>
                        <AlphaCard sectioned title="Name">
                            <SkeletonBodyText />
                        </AlphaCard>
                        <AlphaCard title="ApplicationFrom">
                            <SkeletonBodyText lines={1} />
                        </AlphaCard>
                        <AlphaCard title="ApplicationTo">
                            <SkeletonBodyText lines={1} />
                        </AlphaCard>
                        <AlphaCard sectioned title="Webhook">
                            <SkeletonBodyText lines={1} />
                        </AlphaCard>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page>
            <TitleBar
                title="Edit Integration"
                breadcrumbs={breadcrumbs}
                primaryAction={null}
            />
            <IntegrationForm Integration={Integration} />
        </Page>
    );
}
