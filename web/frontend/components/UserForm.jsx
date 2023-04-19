import { useState, useCallback } from "react";
import {
    AlphaCard,
    AlphaStack,
    Banner,
    Button,
    EmptyState,
    Form,
    FormLayout,
    ChoiceList,
    Icon,
    Label,
    Layout,
    Select,
    Text,
    TextField,
    Thumbnail
} from "@shopify/polaris";
import {
  ContextualSaveBar,
  ResourcePicker,
  useAppBridge,
  useNavigate,
  useToast
} from "@shopify/app-bridge-react";
import { ImageMajor, AlertMinor } from "@shopify/polaris-icons";
import { useParams } from "react-router-dom";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString } from "@shopify/react-form";

export function UserForm({ UserData: InitialUserData }) {
    const [UserData, setUserData] = useState(InitialUserData);
    const [showResourcePicker, setShowResourcePicker] = useState(true);
    //const [selectedApplictionFromId, setSelectedApplictionFromId] = useState(Integration?.applicationFromId);
    const navigate = useNavigate();
    const appBridge = useAppBridge();
    const fetch = useAuthenticatedFetch();
    //const deletedApplicationFrom = Integration?.applicationFromId === "Deleted Application from";

    const onSubmit = useCallback(
        (body) => {
            (async () => {
                const parsedBody = body;
                //parsedBody.destination = parsedBody.destination[0];
                parsedBody.handle = "0";
                const UserId = UserData.User?.pk;
                /* construct the appropriate URL to send the API request to based on whether the QR code is new or being updated */
                const url = UserId ? `/api/user/${UserId}` : "/api/user/";
                /* a condition to select the appropriate HTTP method: PATCH to update a QR code or POST to create a new QR code */
                const method = UserId ? "PATCH" : "POST";
                /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
                const response = await fetch(url, {
                    method,
                    body: JSON.stringify(parsedBody),
                    headers: { "Content-Type": "application/json" },
                });
                if (response.ok) {
                    makeClean();
                    const UserData = await response.json();
                    /* if this is a new QR code, then save the QR code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
                    if (!UserId) {
                        navigate('/user/' + UserData.User.pk);
                        /* if this is a QR code update, update the QR code state in this component */
                    } else {
                        setUserData(UserData);
                    }
                }
            })();
            return { status: "success" };
        },
        [UserData, setUserData]
    );

    /*
      Sets up the form state with the useForm hook.
      Accepts a "fields" object that sets up each individual field with a default value and validation rules.
      Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.
      Returns helpers to manage the form state, as well as the component state that is based on the form state.
    */
    const {
        fields: {
            email,
            planId
        },
        dirty,
        reset,
        submitting,
        submit,
        makeClean,
    } = useForm({
        fields: {
            email: useField({
                value: UserData.User?.email || "",
                validates: [notEmptyString("Please enter your email address")],
            }),
            planId: useField({
                value: UserData.Data.planId
            })
        },
        onSubmit,
    });

    const handleEmailChange = useCallback((id) => {
        email.onChange(id);
    }, []);

    const {show} = useToast();

    const {
        data: planData,
        isLoading: isLoadingPlans,
        isRefetching: isRefetchingPlans,
        isError: isErrorPlans
    } = useAppQuery({
        url: '/api/plans',
        refetchOnReconnect: false,
    });

    const helpTxt = "Please enter your email address to ensure your accounts are always linked."

    /*
This array is used in a select field in the form to manage provider options
*/
    const planOptions = planData
        ?
        planData.map(
            plan => {
                return {
                    label: plan.name,
                    value: plan.pk,
                };
            }
        )
    : [];

    //const shopCheck = shopRetDta?.shopUrl ? shopRetDta.shopUrl.replace(/https?:\/\//, "") : "";
    //const shopName = Integration?.shopDomain ? Integration?.shopDomain.replace(/https?:\/\//, "") : shopCheck;

  /*
    This function runs when a user clicks the "Go to destination" button.
    It uses data from the App Bridge context as well as form state to construct destination URLs using the URL helpers you created.
  */

    /*const appFromName = applications?.applications.find(function (element) {
        return element.pk === selectedApplictionFromId;
    })?.name || applicationOptions[0]?.label || '';*/

    
  /* The form layout, created using Polaris and App Bridge components */
  return (
    <AlphaStack vertical>
        <Layout>
            <Layout.Section>
                <Form>
                    <ContextualSaveBar
                        saveAction={{
                            label: "Save",
                            onAction: submit,
                            loading: submitting,
                            disabled: submitting,
                        }}
                        discardAction={{
                            label: "Discard",
                            onAction: reset,
                            loading: submitting,
                            disabled: submitting,
                        }}
                        visible={dirty}
                        fullWidth
                    />
                    <FormLayout>
                        <AlphaCard>
                            <TextField
                                {...email.value}
                                id="emailAddress"
                                title="Email"
                                label="Email"
                                labelHidden
                                helpText={helpTxt}
                                readOnly />
                        </AlphaCard>
                    </FormLayout>
                </Form>
            </Layout.Section>
            <Layout.Section>
                {{cardMarkup}}
            </Layout.Section>
        </Layout>
    </AlphaStack>
  );
}


