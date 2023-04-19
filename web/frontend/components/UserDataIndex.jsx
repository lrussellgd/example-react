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
    ExceptionList,
    Icon,
    IndexTable,
    Label,
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
    DaysLeft,
    navigate
}) {

    


  return (
      <UnstyledLink onClick={() => navigate(`/user/${User.pk}`)}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}>
            <AlphaStack vertical>
                <p><Text>Total packed orders: {Data.totalOrders}</Text></p>
                <p><Text>{Data.currentOrders} / {Plan.limit} orders packed this period.</Text></p>
                <p>{DaysLeft} days left in current period.</p>
            </AlphaStack>
        </div>
    </UnstyledLink>
  );
}

export function UserDataIndex({ UserData, loading }) {
    const navigate = useNavigate();
    /* Check if screen is small */
    const isSmallScreen = useMedia("(max-width: 640px)");

    var monthEnd = dayjs().endOf('month');
    //console.log(monthEnd.$D);
    
    var endDayCurrMonth = (monthEnd.$D - dayjs().date());
	var signupDay = (dayjs.unix(UserData.Data.createdAt)).date();
 
	var lastDay = signupDay;
	if(signupDay > endDayCurrMonth) {
		lastDay = endDayCurrMonth;
	}
 
	var left = lastDay - dayjs().date();
	if(left === 0) {
		left = 30;
	} else if(left < 0) {
        left = 30 + left;
    }


    /* Map over QRCodes for small screen */
    const smallScreenMarkup = (
        <SmallScreenCard key={UserData.User.pk} navigate={navigate} User={UserData.User} Data={UserData.Data} Plan={UserData.Plan} DaysLeft={left} />
    );

    /* A layout for small screens, built using Polaris components */
    return (        
        <AlphaCard>
            {isSmallScreen ? (
                smallScreenMarkup
            ) : (

                <AlphaStack>
                    <Avatar onClick={() => {
                        navigate(`/user/${UserData.User.pk}`);
                    }}></Avatar>
                    <Text>Total packed orders: {UserData.Data.totalOrders}</Text>
                    <Text>{UserData.Data.currentOrders} / {UserData.Plan.limit} orders packed this period.</Text>
                    <Text>{left} days left in current period.</Text>
                    <AlphaCard background='surface-subdued'>
                        <AlphaStack>
                            <Text>Current Plan: {UserData?.Plan?.name}</Text>
                            <Text>Terms: {UserData?.Plan?.terms}</Text>
                            <Button onClick={() =>{
                                navigate(`/settings/`)
                            }}>Upgrade</Button>
                        </AlphaStack>
                    </AlphaCard>
                </AlphaStack>                
            )}
        </AlphaCard>
    );
}

function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}