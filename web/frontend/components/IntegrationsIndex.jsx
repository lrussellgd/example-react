import { useState, useCallback } from 'react';
import { useNavigate, Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useMedia } from "@shopify/react-hooks"; /* useMedia is used to support multiple screen sizes */
import {
    Icon,
    IndexTable,
    Banner,
    Button,
    Thumbnail,
    UnstyledLink,
    Label,
    ExceptionList,
    AlphaCard,
    AlphaStack,
    Text
} from "@shopify/polaris";

import { DiamondAlertMajor, ImageMajor, NoteMinor } from "@shopify/polaris-icons";

/* dayjs is used to capture and format the date an Integration was created or modified */
import dayjs from "dayjs";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
    pk,
    sk,
    name,
    applicationFromId,
    apiUrl,
    createdAt,
    navigate
}) {
  return (
      <UnstyledLink onClick={() => navigate(`/integrations/${sk}`)}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}>
            <AlphaStack vertical>
                <p><Text>{truncate(name, 35)}</Text></p>
                <p>{dayjs.unix(createdAt).format("MMMM D, YYYY")}</p>
                <div style={{ display: "flex" }}>
                    <div style={{ flex: "3" }}>
                        <Text>Webhook: {apiUrl || "-"}</Text>
                    </div>
                </div>
            </AlphaStack>
        </div>
    </UnstyledLink>
  );
}

export function IntegrationsIndex({ Integrations, loading }) {
    const navigate = useNavigate();
    /* Check if screen is small */
    const isSmallScreen = useMedia("(max-width: 640px)");

    /* Map over QRCodes for small screen */
    const smallScreenMarkup = Integrations.map((Integration) => (
        <SmallScreenCard key={Integration.sk} navigate={navigate} {...Integration} />
    ));

    const resourceName = {
        singular: "Integration",
        plural: "Integrations",
    };
    
    const rowMarkup = Integrations.map((Integration, index) => {
        //({ pk, sk, name, applicationFromId, apiUrl, createdAt }, index) => {
            /* The form layout, created using Polaris components. Includes the QR code data set above. */
            
            return (
                <IndexTable.Row
                    id={Integration.sk}
                    key={Integration.sk}
                    position={index}
                    onClick={() => {
                        navigate(`/integrations/${Integration.sk}`);
                    }}
                >
                    <IndexTable.Cell>
                        <UnstyledLink data-primary-link url={`/integrations/${Integration.sk}`}>
                            {truncate(Integration.name, 25)}
                        </UnstyledLink>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <Label id={`webhookText-${Integration.sk}`} size="medium">{Integration.apiUrl}</Label>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        {dayjs.unix(Integration.createdAt).format("MMMM DD, YYYY")}
                    </IndexTable.Cell>
                </IndexTable.Row>
            );
        }
    );

    /* A layout for small screens, built using Polaris components */
    return (        
        <AlphaCard>
             <Banner title="Webhooks" Icon={DiamondAlertMajor} status='warning' onDismiss={() => {}}>
                <p>NEVER share your API webhook urls with anyone! They should ONLY be used in the specified applications.</p>
            </Banner>
            {isSmallScreen ? (
                smallScreenMarkup
            ) : (
                <IndexTable
                    resourceName={resourceName}
                    itemCount={Integrations.length}
                    headings={[
                        { title: "Name" },
                        { title: "Webhook" },
                        { title: "Date created" }
                    ]}
                    selectable={false}
                    loading={loading}
                >
                    {rowMarkup}
                </IndexTable>
            )}
        </AlphaCard>
    );
}

function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}