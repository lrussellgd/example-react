import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
    AlphaCard,
    AlphaStack,
    Box,
    Columns,
    EmptyState,
    Layout,
    Page,
    SkeletonBodyText,
    Text,
    TextField
} from "@shopify/polaris";
import { useAppQuery } from "../hooks";
import {SettingsIndex} from "../components";

export default function SettingsPage() {

    const navigate = useNavigate();

    const {
        data: Plans,
        isLoading,
        isRefetching,
    } = useAppQuery({
        url: "/api/plans",
    });


    const {
        data: UserData,
        isUserDataLoading,
        isUserDataRefetching,
    } = useAppQuery({
        url: "/api/user",
    });

    const loadingMarkup = (isLoading || isUserDataLoading) ? (
        <AlphaCard>
            <Loading />
            <SkeletonBodyText />
        </AlphaCard>
    ) : null;

    const settingsMarkup = UserData?.User?.pk ? (
        <SettingsIndex Plans={Plans?.plans} UserData={UserData} isRefetching={isRefetching || isUserDataRefetching} loading={isLoading || isUserDataLoading}  />
    ) : null;

    const emptyStateMarkup = (!isLoading && !isUserDataLoading) && !UserData?.User?.pk ? (
        <AlphaCard>
            <EmptyState
                heading="Something went wrong"
                /* This button will take the user to a Create an Integration page */
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
            </EmptyState>
        </AlphaCard>
    ) : null;

    return (
        <Page divider fullWidth={!!settingsMarkup}>
            <TitleBar title="Settings" />
            <Layout>
                <Layout.Section>
                    {loadingMarkup}
                    {settingsMarkup}
                    {emptyStateMarkup}
                </Layout.Section>
            </Layout>
        </Page>
    );
}