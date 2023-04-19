import {
  AlphaCard,
  AlphaStack,
  EmptyState,
  Image,
  Label,
  Layout,
  Link,
  Page,
  SkeletonBodyText,
  Text
} from "@shopify/polaris";
import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";

import { useAppQuery } from "../hooks";
import { UserDataIndex } from "../components";

import { trophyImage } from "../assets";

export default function HomePage() {
  const navigate = useNavigate();

  const {
      data: UserData,
      isLoading,
      isRefetching,
  } = useAppQuery({
      url: "/api/user/",
  });

  const loadingMarkup = isLoading ? (
    <AlphaCard>
        <Loading />
        <SkeletonBodyText />
    </AlphaCard>
  ) : null;

  const userDataMarkup = UserData? (
      <UserDataIndex UserData={UserData} loading={isRefetching}  />
  ) : null;

  const emptyStateMarkup =
    !isLoading && !UserData?.Data?.planId?.length ? (
        <AlphaCard>
            <EmptyState
                heading="Welcome to Cart Packer!"
                /* This button will take the user to a Create an Integration page */
                action={{
                    content: "Choose an account type",
                    onAction: () => navigate(`/account/setup`),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>
                    Setup Your account.
                </p>
            </EmptyState>
        </AlphaCard>
    ) : null;

  return (
    <Page fullWidth={!!userDataMarkup}>
      <TitleBar title="Cart Packer" />
      <Layout>
          <Layout.Section>
              {loadingMarkup}
              {userDataMarkup}
              {emptyStateMarkup}
          </Layout.Section>
      </Layout>
    </Page>
  );
}
