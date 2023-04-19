import { useState, useCallback } from 'react';
import { useNavigate, Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useMedia } from "@shopify/react-hooks"; /* useMedia is used to support multiple screen sizes */
import {
    AlphaCard,
    AlphaStack,
    Avatar,
    Banner,
    Button,
    Columns,
    ExceptionList,
    Icon,
    IndexTable,
    Label,
    Layout,
    Text,
    Thumbnail,
    UnstyledLink
} from "@shopify/polaris";

import { DiamondAlertMajor, ImageMajor, NoteMinor } from "@shopify/polaris-icons";

/* dayjs is used to capture and format the date an Integration was created or modified */
import dayjs from "dayjs";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
    User,
    Data,
    Plan,
    AllPlans,
    navigate
}) {
  return (
      <AlphaCard>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}>
            <AlphaStack vertical>

            </AlphaStack>
        </div>
    </AlphaCard>
  );
}

export function SettingsIndex({ Plans, UserData, loading }) {
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    /* Check if screen is small */
    const isSmallScreen = useMedia("(max-width: 640px)");

    /* Map over QRCodes for small screen */
    const smallScreenMarkup = (
        <SmallScreenCard key={UserData.User.pk} navigate={navigate} User={UserData.User} Data={UserData.Data} Plan={UserData.Plan} AllPlans={Plans} />
    );

    const [isPlanChanging, setIsPlanChanging] = useState(false);
    const handlePlanChange = useCallback(async (id) => {
        setIsPlanChanging(true);
        const response = await fetch('/api/settings/change-plan/' + id, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(UserData)
        });

        console.log(response);
        if (response.ok) {
            var retPlan = await response.json();
            navigate(retPlan.confirmationUrl);
        }
    });

    /* A layout for small screens, built using Polaris components */
    return (    
        <Layout>
            <Layout.Section>
                <Banner>Settings</Banner>
            </Layout.Section>
            {isSmallScreen ? (
                <Layout.Section>
                    smallScreenMarkup
                </Layout.Section>
            ) : (
                <Layout.Section>
                    <AlphaStack gap="5" align='start'>
                        <Text as="h3" variant="headingLg">Plans</Text>
                        <Columns gap="4" columns={Plans?.length}>
                        {Plans?.map((Plan, index) => {
                            return (
                                <AlphaCard key={index} roundedAbove="sm">
                                    {(UserData?.Data?.planId !== Plan.pk)  && (
                                        <AlphaStack gap="4">
                                            <Text>Name: {Plan?.name}</Text>
                                            {(Plan?.limit === -1) &&  (
                                                <Text>Limit: Unlimited packed per month.</Text>
                                            )}
                                            {(Plan?.limit !== -1) &&  (
                                                <Text>Limit: {Plan?.limit} orders packed per month.</Text>
                                            )}
                                             <br />
                                            <Text>Price: ${Plan?.price} / Month</Text>
                                            {(UserData?.Plan?.price > Plan?.price) && (
                                                <Button onClick={async () => { await handlePlanChange(Plan.pk)}} loading={isPlanChanging}>Downgrade</Button>

                                            )}
                                            {(UserData?.Plan?.price < Plan?.price) && (
                                                <Button onClick={async () => { await handlePlanChange(Plan.pk)}} loading={isPlanChanging}>Upgrade Now!</Button>
                                            )}
                                        </AlphaStack>                
                                    )}
                                    {(UserData?.Data?.planId === Plan?.pk)  && (
                                        <AlphaStack gap="4">
                                            <Text>Name: {Plan?.name}</Text>
                                            {(Plan?.limit === -1) &&  (
                                                <Text>Limit: Unlimited packed per month.</Text>
                                            )}
                                            {(Plan?.limit !== -1) &&  (
                                                <Text>Limit: {Plan?.limit} orders packed per month.</Text>
                                            )}
                                             <br />
                                            <Text>Price: ${Plan?.price} / Month</Text>
                                            <Button disabled>Current Plan</Button>
                                        </AlphaStack>     
                                    )}
                                </AlphaCard>
                            );
                        })}
                        </Columns>
                    </AlphaStack>    
                </Layout.Section>        
            )}
        </Layout>
    );
}

function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}