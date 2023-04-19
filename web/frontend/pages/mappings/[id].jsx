import { useParams } from "react-router-dom";
import { AlphaCard, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery } from "../../hooks";
import { MappingForm } from "../../components";

export default function MappingEdit() {
    const { id } = useParams();

    /*
      Fetch the Integration.
      useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
      The backend supplements app data with data queried from the Shopify GraphQL Admin API.
    */
    const {
        data: Mapping,
        isLoading,
        isRefetching,
    } = useAppQuery({
        url: `/api/mappings/${id}`,
        reactQueryOptions: {
            /* Disable refetching because the QRCodeForm component ignores changes to its props */
            refetchOnReconnect: false,
        },
    });

    const breadcrumbs = [{ content: "Mappings", url: "/" }];

    /* Loading action and markup that uses App Bridge and Polaris components */
    if (isLoading || isRefetching) {
        return (
            <Page>
                <TitleBar
                    title="Edit Mapping"
                    breadcrumbs={breadcrumbs}
                    primaryAction={null}
                />
                <Loading />
                <Layout>
                    <Layout.Section>
                        <AlphaCard sectioned title="Name">
                            <SkeletonBodyText />
                        </AlphaCard>
                        <AlphaCard sectioned title="Integration">
                            <SkeletonBodyText lines={1} />
                        </AlphaCard>
                        <AlphaCard sectioned title="External Product">
                            <SkeletonBodyText lines={3} />
                        </AlphaCard>
                        <AlphaCard sectioned title="Internal Product">
                            <SkeletonBodyText lines={3} />
                        </AlphaCard>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page>
            <TitleBar
                title="Edit Mapping"
                breadcrumbs={breadcrumbs}
                primaryAction={null}
            />
            <MappingForm Mapping={Mapping} />
        </Page>
    );
}
