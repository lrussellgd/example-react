import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { IntegrationForm } from "../../components";
export default function ManageCode() {
    const breadcrumbs = [{ content: "Integrations", url: "/" }];

    return (
        <Page>
            <TitleBar
                title="Create new Integration"
                breadcrumbs={breadcrumbs}
                primaryAction={null}
            />
            <IntegrationForm />
        </Page>
    );
}