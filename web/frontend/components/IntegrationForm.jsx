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

export function IntegrationForm({ Integration: InitialIntegration }) {
    const [Integration, setIntegration] = useState(InitialIntegration);
    const [showResourcePicker, setShowResourcePicker] = useState(true);
    const [selectedApplictionFromId, setSelectedApplictionFromId] = useState(Integration?.applicationFromId);
    const navigate = useNavigate();
    const appBridge = useAppBridge();
    const fetch = useAuthenticatedFetch();
    const deletedApplicationFrom = Integration?.applicationFromId === "Deleted Application from";

    const onSubmit = useCallback(
        (body) => {
            (async () => {
                const parsedBody = body;
                //parsedBody.destination = parsedBody.destination[0];
                parsedBody.handle = "0";
                const IntegrationId = Integration?.pk;
                /* construct the appropriate URL to send the API request to based on whether the QR code is new or being updated */
                const url = IntegrationId ? `/api/integrations/${IntegrationId}` : "/api/integrations";
                /* a condition to select the appropriate HTTP method: PATCH to update a QR code or POST to create a new QR code */
                const method = IntegrationId ? "PATCH" : "POST";
                /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
                const response = await fetch(url, {
                    method,
                    body: JSON.stringify(parsedBody),
                    headers: { "Content-Type": "application/json" },
                });
                if (response.ok) {
                    makeClean();
                    const Integration = await response.json();
                    /* if this is a new QR code, then save the QR code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
                    if (!IntegrationId) {
                        navigate('/integrations/' + Integration.pk);
                        /* if this is a QR code update, update the QR code state in this component */
                    } else {
                        setIntegration(Integration);
                    }
                }
            })();
            return { status: "success" };
        },
        [Integration, setIntegration]
    );

    /*
      Sets up the form state with the useForm hook.
      Accepts a "fields" object that sets up each individual field with a default value and validation rules.
      Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.
      Returns helpers to manage the form state, as well as the component state that is based on the form state.
    */
    const {
        fields: {
            name,
            applicationFromId,
            apiUrl
        },
        dirty,
        reset,
        submitting,
        submit,
        makeClean,
    } = useForm({
        fields: {
            name: useField({
                value: Integration?.name || "",
                validates: [notEmptyString("Please name your Integration")],
            }),
            applicationFromId: useField({
                value: deletedApplicationFrom ? "Deleted Application from" : Integration?.applicationFromId || "",
                validates: [notEmptyString("Please select a From Application")]
            }),
            apiUrl: useField({
                value: Integration?.apiUrl || ""
            })
        },
        onSubmit,
    });

    const handleApplicationFromChange = useCallback((id) => {
        //console.log(JSON.stringify(providers.providers[id]));
        setSelectedApplictionFromId(id);
        applicationFromId.onChange(id);
    }, []);

    const toggleResourcePicker = useCallback(
        () => setShowResourcePicker(!showResourcePicker),
        [showResourcePicker]
    );

    var helpTxt = "Copy and paste this into your outbound API";

    const {show} = useToast();

    const copyWebhook = useCallback(async () => {
        //await clipboardy.write(Integration?.provider?.urls["shopify"]);
        var copyText = document.getElementById("webhookText");
        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */

        //iframe blocks clipboard api so fallback
        //onto deprecated method until Shopify update this
        navigator.permissions.query({ name: 'clipboard-write' }).then(function (result) {
            if (result.state == 'granted') {
                navigator.clipboard.writeText(copyText.value);
                show('Copied to clipboard successfully!', {duration: 2000});
                //copyText.setAttribute("helpText", "Copied to clipboard successfully!");
                //document.getElementById("webhookTextHelpText").getElementsByTagName("span")[0].textContent = "Copied to clipboard successfully!"
            }
        });
    }, [Integration]);

    const {
        data: applications,
        isLoading: isLoadingApplications,
        isRefetching: isRefetchingApplications,
        isError: isErrorApplications
    } = useAppQuery({
        url: '/api/applications',
        refetchOnReconnect: false,
    });

    /*const {
        data: shopRetDta,
        isLoading: isLoadingShopUrl,
        isRefetching: isRefetchingShopUrl,
        isError: isErrorShopUrl

    } = useAppQuery({
        url: '/api/shop',
        refetchOnReconnect: false,
    });*/

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteIntegration = useCallback(async () => {
    reset();
    /* The isDeleting state disables the download button and the delete QR code button to show the merchant that an action is in progress */
    setIsDeleting(true);
    const response = await fetch('/api/integrations/' + Integration.pk, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate(`/`);
    }
  }, [Integration]);

    /*
This array is used in a select field in the form to manage provider options
*/



    const applicationOptions = applications
        ?
            applications.applications.map(
                appDta => {
                    return {
                        label: appDta.name,
                        value: appDta.pk,
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

    const appFromName = applications?.applications.find(function (element) {
        return element.pk === selectedApplictionFromId;
    })?.name || applicationOptions[0]?.label || '';

  /* The form layout, created using Polaris and App Bridge components */
  return (
    <AlphaStack vertical>
        {deletedApplicationFrom && (
            <Banner
                title="The From Application for this Integration no longer exists."
                status="critical"
            >
                <p>
                    Currently no orders will be directed to Shopify unless you choose another
                    From Application for this Integration.
                </p>
            </Banner>
        )}
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
                                {...name}
                                label="Name"
                                labelHidden
                                helpText="Only store staff can see this title"
                            />
                        </AlphaCard>
                        <AlphaCard> 
                            {showResourcePicker && (
                                <Select
                                    label="FromApplication"
                                    disabled={isLoadingApplications || isErrorApplications}
                                    options={applicationOptions}
                                    onChange={handleApplicationFromChange}
                                    value={applicationFromId.value}
                                    labelHidden
                                />                                     
                            )}
                            {applicationFromId.value && (
                                <AlphaStack alignment="fill">
                                    <Label>{appFromName}</Label>
                                </AlphaStack>
                            )}
                        </AlphaCard>
                        <AlphaCard>
                                <TextField
                                    {...apiUrl.value}
                                    id="webhookText"
                                    title="Webhook url"
                                    label="WebhookURL"
                                    labelHidden
                                    helpText={helpTxt}
                                    readOnly />
                                <Button
                                    primary
                                    onClick={copyWebhook}
                                    disabled={isDeleting}
                                >
                                    Copy
                                </Button>
                        </AlphaCard>
                    </FormLayout>
                </Form>
            </Layout.Section>            
            <Layout.Section>
                {Integration?.pk && (
                    <Button
                        outline
                        destructive
                        onClick={deleteIntegration}
                        loading={isDeleting}
                    >
                        Delete Integration
                    </Button>
                )}
            </Layout.Section>
        </Layout>
    </AlphaStack>
  );
}


