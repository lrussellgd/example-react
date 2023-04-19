import { useState, useCallback } from 'react';
import { useNavigate, Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import {
    AlphaCard,
    AlphaStack,
    Button,
    Icon,
    IndexTable,
    Label,
    Text,
    Thumbnail,
    UnstyledLink
} from "@shopify/polaris";
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";

/* useMedia is used to support multiple screen sizes */
import { useMedia } from "@shopify/react-hooks";

/* dayjs is used to capture and format the date an Integration was created or modified */
import dayjs from "dayjs";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
    pk,
    sk,
    name,
    Integration,
    ProductFrom,
    ProductTo,
    ProductToVariant,
    ApplicationFrom,
    createdAt,
    navigate
}) {
  return (
      <UnstyledLink onClick={() => navigate(`/mappings/${sk}`)}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}>  
            <AlphaStack>
                    <p>{truncate(Integration.name, 25)}</p>
                    <p>{truncate(ProductFrom?.name, 25)}</p>
                    <p>{truncate(ProductTo?.title, 25)}</p>
            </AlphaStack>
        </div>
    </UnstyledLink>
  );
}

export function MappingsIndex({ Mappings, loading }) {
    const navigate = useNavigate();
    /* Check if screen is small */
    const isSmallScreen = useMedia("(max-width: 640px)");

    /* Map over QRCodes for small screen */
    const smallScreenMarkup = Mappings.map((Mapping) => (
        <SmallScreenCard key={Mapping.sk} navigate={navigate} {...Mapping} />
    ));

    const resourceName = {
        singular: "Mapping",
        plural: "Mappings",
    };

    

    const rowMarkup = Mappings.map((Mapping, index) => {
            const deletedToProduct = Mapping?.ProductTo?.title?.includes("Deleted product");
            //console.log("Mapped: " + Mapping.ProductFrom?.mapped);
            /* The form layout, created using Polaris components. Includes the QR code data set above. */
            return (
                <IndexTable.Row
                    id={Mapping.sk}
                    key={Mapping.sk}
                    position={index}
                    onClick={() => {
                        navigate(`/mappings/${Mapping.sk}`);
                    }}
                >
                    <IndexTable.Cell>
                        {Mapping.ApplicationFrom?.sk &&  (
                            <Label>
                                {truncate(Mapping.ApplicationFrom?.name, 25)} - Product: {truncate(Mapping.ProductFrom?.name, 25)}
                            </Label>                           
                        )}
                    </IndexTable.Cell>                               
                    <IndexTable.Cell>                        
                        <AlphaStack>
                            {Mapping?.ProductTo?.id &&  (
                                
                                <Thumbnail source={Mapping?.ProductTo?.image.url} alt={Mapping?.ProductTo?.title} />
                            )}
                            {Mapping?.ProductTo?.id &&  (
                                <Label size="small">
                                    {truncate(Mapping?.ProductTo?.title, 25)}
                                </Label>
                            )}
                            {Mapping?.ProductToVariant?.id &&  (
                                <Label size="small">
                                    Variant: {truncate(Mapping?.ProductToVariant?.title, 25)}
                                </Label>
                            )}
                        </AlphaStack>                    
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        {((Mapping.ProductFrom?.mapped <= 0) || deletedToProduct) && (
                            <AlphaStack>
                                <Label size="small">
                                    WARNING: Product Must Be Mapped to Process Orders!
                                </Label>
                                <Button onClick={() => { navigate(`/mappings/${Mapping?.sk}`); }}>
                                    Map Now!
                                </Button>                           
                            </AlphaStack>
                        )}
                        {((Mapping.ProductFrom?.mapped > 0) && !deletedToProduct) && (
                            <Button onClick={() => { navigate(`/mappings/${Mapping?.sk}`); }}>
                                Unmap
                            </Button>)                           
                        }
                    </IndexTable.Cell>
                </IndexTable.Row>
            );
        }
    );

    /* A layout for small screens, built using Polaris components */
    return (
        <AlphaCard>
            {isSmallScreen ? (
                smallScreenMarkup
            ) : (
                <IndexTable
                    resourceName={resourceName}
                    itemCount={Mappings.length}
                    headings={[
                        { title: "External Product" },
                        { title: "Shopify Product" },
                        { title: "Action"}
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
    if(str === undefined) {
        return '';
    }
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}