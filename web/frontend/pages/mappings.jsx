import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
    AlphaCard,
    EmptyState,
    Layout,
    Page,
    SkeletonBodyText,
} from "@shopify/polaris";
import { useAppQuery } from "../hooks";
import { MappingsIndex } from "../components";

export default function ProductMappingsPage() {

    const navigate = useNavigate();

    const {
        data: Mappings,
        isLoading,
        isRefetching,
    } = useAppQuery({
        url: "/api/mappings",
    });

    const loadingMarkup = isLoading ? (
        <AlphaCard>
            <Loading />
            <SkeletonBodyText />
        </AlphaCard>
    ) : null;
    
    const mappingsMarkup = Mappings?.length ? (
        <MappingsIndex Mappings={Mappings} loading={isRefetching}  />
    ) : null;

    const emptyStateMarkup = !isLoading && !Mappings?.length ? (
        <AlphaCard>
            <EmptyState
                heading="No Incoming Products To Map"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>
                    There are currently no incoming products to map.
                </p>
            </EmptyState>
        </AlphaCard>
    ) : null;

  return (
    <Page fullWidth={!!mappingsMarkup}>
      <TitleBar
          title="Mappings"
      />
      <Layout>
          <Layout.Section>
              {loadingMarkup}
              {mappingsMarkup}
              {emptyStateMarkup}
          </Layout.Section>
      </Layout>
    </Page>
  );



}