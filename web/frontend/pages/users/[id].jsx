import { useParams } from "react-router-dom";
import { AlphaCard, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery } from "../../hooks";
import { UserForm } from "../../components";

export default function UserEdit() {
    const { id } = useParams();

    /*
      Fetch the Integration.
      useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
      The backend supplements app data with data queried from the Shopify GraphQL Admin API.
    */
    const {
        data: UserData,
        isLoading,
        isRefetching,
    } = useAppQuery({
        url: `/api/user/${id}`,
        reactQueryOptions: {
            refetchOnReconnect: true,
        },
    });

    const breadcrumbs = [{ content: "User", url: "/" }];

    /* Loading action and markup that uses App Bridge and Polaris components */
    if (isLoading || isRefetching) {
        return (
            <Page>
                <TitleBar
                    title="Edit Your Details"
                    breadcrumbs={breadcrumbs}
                    primaryAction={null}
                />
                <Loading />
                <Layout>
                    <Layout.Section>
                        <AlphaCard sectioned title="Email">
                            <SkeletonBodyText />
                        </AlphaCard>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page>
            <TitleBar
                title="Edit Your Details"
                breadcrumbs={breadcrumbs}
                primaryAction={null}
            />
            <UserForm User={UserData} />
        </Page>
    );
}
