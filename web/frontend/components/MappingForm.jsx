import { useState, useCallback, useMemo } from "react";
import {
    AlphaCard,
    AlphaStack,
    Autocomplete,
    Banner,
    Button,
    ChoiceList,
    EmptyState,
    Form,
    FormLayout,
    Icon,
    Image,
    Label,
    Layout,
    Text,
    TextField,
    Thumbnail,
    Select
} from "@shopify/polaris";
import {
  ContextualSaveBar,
  ResourcePicker,
  useAppBridge,
  useNavigate,
} from "@shopify/app-bridge-react";
import { ImageMajor, AlertMinor, SearchMinor, AddProductMajor, RemoveProductMajor  } from "@shopify/polaris-icons";
import { useParams } from "react-router-dom";


/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString } from "@shopify/react-form";

export function MappingForm({ Mapping: InitialMapping }) {

    var isLoadingToProductVariants = false;
    var searchProductTitle = '';
    var productSearchVariantName = '';
    var searchedProdOptions = [];

    const [Mapping, setMapping] = useState(InitialMapping);
    const [showResourcePicker, setShowResourcePicker] = useState(true);
    const [selectedProductFromId, setSelectedProductFromId] = useState(Mapping?.ProductFrom?.sk);
    const [selectedProductToId, setSelectedProductToId] = useState(Mapping?.ProductTo?.shopifyProductId);
    const [selectedProductToName, setSelectedProductToName] = useState(Mapping?.ProductTo?.name);
    const [selectedProductToVariantId, setSelectedProductToVariantId] = useState(Mapping?.ProductToVariant?.shopifyProductId);
    const [toProductOptions, setToProductOptions] = useState([]);
    const [toProductVariants, setToProductVariants] = useState([]);
    const navigate = useNavigate();
    const appBridge = useAppBridge();
    const fetch = useAuthenticatedFetch();
    const deletedProductFrom = Mapping?.ProductFrom?.name === "Deleted product";
    const deletedProductTo = Mapping?.ProductTo?.title === "Deleted product";
    const deletedProductToVariant = Mapping?.ProductToVariant?.title === "Deleted product variant";

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(toProductOptions);

    const onSubmit = useCallback(
        (body) => {
            (async () => {
                const parsedBody = body;
                //parsedBody.destination = parsedBody.destination[0];
                parsedBody.handle = "0";
                const MappingId = Mapping?.sk;
                /* construct the appropriate URL to send the API request to based on whether the QR code is new or being updated */
                const url = MappingId ? `/api/mappings/${MappingId}` : "/api/mappings";
                /* a condition to select the appropriate HTTP method: PATCH to update a QR code or POST to create a new QR code */
                const method = MappingId ? "PATCH" : "POST";
                /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
                const response = await fetch(url, {
                    method,
                    body: JSON.stringify(parsedBody),
                    headers: { "Content-Type": "application/json" },
                });
                if (response.ok) {
                    console.log("response ok");
                    makeClean();
                    const Mapping = await response.json();
                    /* if this is a new QR code, then save the QR code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
                    if (!MappingId) {
                        navigate('/mappings/' + Mapping?.sk);
                        /* if this is a QR code update, update the QR code state in this component */
                    } else {
                        setMapping(Mapping);
                    }
                }
            })();
            return { status: "success" };
        },
        [Mapping, setMapping]
    );

    /*
      Sets up the form state with the useForm hook.
      Accepts a "fields" object that sets up each individual field with a default value and validation rules.
      Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.
      Returns helpers to manage the form state, as well as the component state that is based on the form state.
    */
    const {
        fields: {
            productFromId,
            productToId,
            productToName,
            productToVariantId,
            productToVariantName
        },
        dirty,
        reset,
        submitting,
        submit,
        makeClean,
    } = useForm({
        fields: {
            productFromId: useField({
                value: deletedProductFrom ? "Deleted product" : Mapping?.ProductFrom?.sk || "",
                validates: [notEmptyString("Please select a From Product")]
            }),
            productToId: useField({
                value: deletedProductTo ? "Unmapped product" : Mapping?.ProductTo?.shopifyProductId || "",
                validates: [notEmptyString("Please select a To Product")]
            }),
            productToName: useField({
                value: deletedProductTo ? "Unmapped product" : Mapping?.ProductTo?.name || "",
                validates: [notEmptyString("Please select a To Product")]
            }),
            productToVariantId: useField({
                value: deletedProductToVariant ? "Unmapped product variant" : Mapping?.ProductToVariant?.shopifyProductId || "",
            }),
            productToVariantName:  useField({
                value: deletedProductToVariant ? "Unmapped product variant" : Mapping?.ProductToVariant?.title || "",
            })
        },
        onSubmit,
    });
   
    const updateText = useCallback(
        async (value) => {
            setInputValue(value);

          
        if (value === '') {
            setOptions(toProductOptions);
            return;
        }

        var urlStr = `/api/shopify-products/title/${value}`;

        var prodOpts = [];
        const response = await fetch(urlStr, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });


        if (response.ok) {
            var retProdDta = await response.json();
            prodOpts = retProdDta.products;
        }       
         

        var currProdOptions = prodOpts
            ?
            prodOpts?.map(
                    toProd => {
                        return {
                            label: toProd?.title,
                            value: toProd?.shopifyProductId,
                        };
                    }
            ) : [];


        
        setOptions(currProdOptions);
          //productSearchToName.onChange(value);
          //productToId.onChange(value);
          
         
         // if (value === '') {
        //    setOptions([]);label
         //   return;
        //  }

          //const filterRegex = new RegExp(value, 'i');
          //const resultOptions = productToOptions.filter((option) =>
            //option.label.match(filterRegex),
          //);
          //setOptions(options);
        },
        [toProductOptions],
      );
    
      const updateSelection = useCallback(
        async (selected) => {

            //console.log(selected);
            const selectedValue = selected.map((selectedItem) => {
                const matchedOption = options.find((option) => {
                return option.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });
        
            setSelectedOptions(selected);
            setInputValue(selectedValue[0]);
            //console.log(selectedValue)
            ///
            setSelectedProductToName(selectedValue[0]);
            productToName.onChange(selectedValue[0]);

            setSelectedProductToId(selected[0]);
            productToId.onChange(selected[0]);
               
            isLoadingToProductVariants = true;
            var urlVarStr = `/api/shopify-products/variants/${selected[0]}`;
            const varResponse = await fetch(urlVarStr, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            isLoadingToProductVariants = false;
            if (varResponse.ok) {
                var retProdVarDta = await varResponse.json();
                setToProductVariants(retProdVarDta.variants);
            }
        },
        [options],
      );
    

    const handleProductFromChange = useCallback((id) => {
        //console.log(JSON.stringify(providers.providers[id]));
        setSelectedProductFromId(id);
        productFromId.onChange(id);
    }, []);

    const handleProductToVariantChange = useCallback((id) => {
        setSelectedProductToVariantId(id);
        productToVariantId.onChange(id);

        var fndVarOption = productToVariantOptions?.find((option) => {
            return option.value.match(id);
        });
        
        var variantName = fndVarOption.label;
        productToVariantName.onChange(variantName);
    });

    const toggleResourcePicker = useCallback(
        () => setShowResourcePicker(!showResourcePicker),
        [showResourcePicker]
    );

    const {
        data: fromProducts,
        isLoading: isLoadingFromProducts,
        isRefetching: isRefetchingFromProducts,
        isError: isErrorFromProducts
    } = useAppQuery({
        url: '/api/internal-products',
        refetchOnReconnect: false,
    });
    

    /*const {
        data: toProducts,
        isLoading: isLoadingToProducts,
        isRefetching: isRefetchingToProducts,
        isError: isErrorToProducts
    } = useAppQuery({
        url: '/api/shopify-products',
        refetchOnReconnect: false,
    });*/

  /*  const {
        data: toProductVariants,
        isLoading: isLoadingToProductVariants,
        isRefetching: isRefetchingToProductVariants,
        isError: isErrorToProductVariants
    } = useAppQuery({
        url: `/api/shopify-products/variants/${productToId?.value}`,
        refetchOnReconnect: false,
    });

*/    


    
    
    /*const {
        data: shopRetDta,
        isLoading: isLoadingShopUrl,
        isRefetching: isRefetchingShopUrl,
        isError: isErrorShopUrl

    } = useAppQuery({
        url: '/api/shop',
        refetchOnReconnect: false,
    });*/

    const [isUnmapping, setIsUnMapping] = useState(false);
    const unmapMapping = useCallback(async () => {
        reset();
        setIsUnMapping(true);
        const response = await fetch('/api/mappings/unmap/' + Mapping.sk, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Mapping)
        });

        if (response.ok) {
            navigate(`/mappings`);
        }
    }, [Mapping]);
  

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMapping = useCallback(async () => {
    reset();
    setIsDeleting(true);
    const response = await fetch('/api/mappings/' + Mapping.sk, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate(`/mappings`);
    }
  }, [Mapping]);

    /*
This array is used in a select field in the form to manage provider options
*/

    //var selVariant = document.getElementById("variantSelect");
    //selVariant.onscroll((ev) => {
      //  if(ev.)
   // });

    const productFromOptions = fromProducts
        ?
            fromProducts?.products?.map(
                fromProd => {
                    return {
                        label: fromProd?.name,
                        value: fromProd?.sk,
                    };
                }
            )
        : [];

    const productToVariantOptions = toProductVariants 
        ?
        toProductVariants?.map(
            toVariant => {
                return {
                    label: toVariant?.title,
                    value: toVariant?.shopifyProductId,
                };
            }
        )
        : [];

    var productFromName = '';
    if(fromProducts !== undefined && fromProducts.products !== undefined && fromProducts.products.length > 0 &&
       productFromOptions !== undefined && productFromOptions.length > 0) {
        productFromName = fromProducts?.products?.find(function (element) {
            return element.sk === selectedProductFromId;
        })?.name || productFromOptions[0]?.label || '';
    }

    var productSearchToName = inputValue;


    

    var productSearchVariantName = '';
    if(toProductVariants !== undefined && toProductVariants.length > 0) {
        productSearchVariantName = toProductVariants?.find(function (element) {
            return element?.shopifyProductId === selectedProductToVariantId;
        })?.title || '';
    }
    

    //const productFromName =  fromProducts  [selectedProductFromId]?.name;
    //const productToName = toProducts[selectedProductToId]?.title;

    const textField = (
        <Autocomplete.TextField
          onChange={updateText}
          label="Product"
          value={inputValue}
          prefix={<Icon source={SearchMinor} color="base" />}
          placeholder="Search"
        />
      );

  /* The form layout, created using Polaris and App Bridge components */
  return (
    <AlphaStack>
        {deletedProductFrom && (
            <Banner
                title="The From Product for this Mapping no longer exists."
                status="critical"
            >
                <p>
                    Currently no orders will be directed to Shopify unless you choose another
                    From Product for this Mapping.
                </p>
            </Banner>
        )}
        {deletedProductTo && (
            <Banner
                title="The To Product Is Unmapped!"
                status="critical"
            >
                <p>
                    Currently no orders will be directed to Shopify unless you choose a
                    Shopify Product for this Mapping.
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
                        <AlphaCard title="From Product"> 
                            {deletedProductFrom && showResourcePicker && (
                                <Select
                                    label="FromProduct"
                                    disabled={isLoadingFromProducts || isErrorFromProducts}
                                    options={productFromOptions}
                                    onChange={handleProductFromChange}
                                    value={productFromId.value}
                                    labelHidden
                                />                                     
                            )}
                            {Mapping?.ApplicationFrom?.pk &&  (   
                                <AlphaStack>
                                    <Text variant="headingLg">Product From</Text>
                                    <Thumbnail
                                        source={Mapping?.ApplicationFrom?.image || "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                                        alt="applicationFromImage"
                                        color="base"
                                        size="small"
                                    />
                                    <Text>{Mapping?.ApplicationFrom?.name}</Text>
                                    <br />                              
                                    <Thumbnail
                                        source={Mapping?.ProductFrom?.image || "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                                        alt="productFromImage"
                                        color="base"
                                        size="small"
                                    />
                                    <Text>Product: {Mapping?.ProductFrom?.name}</Text>
                                </AlphaStack>
                            )}
                        </AlphaCard>
                        <AlphaCard>
                            {(Mapping?.ProductFrom?.mapped > 0) && (
                                <AlphaStack>
                                <Text variant="headingLg">Product To</Text>
                                <Thumbnail size="small" source={Mapping?.ProductTo?.image?.url || "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"} alt={Mapping?.ProductTo?.title || ""} />
                                <Text>Product: {Mapping?.ProductTo?.title}</Text>
                                {Mapping?.ProductToVariant?.title != "" && (
                                    <Text>Variant: {Mapping?.ProductToVariant?.title}</Text>
                                )}
                                {Mapping?.ProductToVariant?.image?.url != "" && (
                                    <Thumbnail size="small" source={Mapping?.ProductToVariant?.image?.url} alt={Mapping?.ProductToVariant?.title || ""} />
                                        
                                )}
                               
                                <Button destructive outline onClick={unmapMapping} loading={isUnmapping}>
                                    Unmap
                                </Button>

                                </AlphaStack>

                                
                            )}
                            {Mapping?.ProductFrom?.mapped <= 0 && (
                            <AlphaStack>
                                    <Icon source={AddProductMajor} color="base" />
                                    <Autocomplete
                                        options={options}
                                        selected={selectedOptions}
                                        onSelect={updateSelection}
                                        textField={textField}
                                    />
                                    {productToId.value && (
                                        <Text>{productSearchToName}</Text>
                                    )} 
                                    {showResourcePicker && (
                                        <Select
                                            label="ToProductVariant"
                                            disabled={isLoadingToProductVariants}
                                            options={productToVariantOptions}
                                            onChange={handleProductToVariantChange}
                                            value={productToVariantId.value}
                                            labelHidden
                                        />                               
                                    )}
                                    {productToVariantId.value && (
                                        <Text>{productSearchVariantName}</Text>
                                    )}                                
                                </AlphaStack>
                        )}
                        </AlphaCard>                        
                    </FormLayout>
                </Form>
            </Layout.Section>            
            <Layout.Section>
                {Mapping?.sk && (
                    <Button
                        outline
                        destructive
                        onClick={deleteMapping}
                        loading={isDeleting}
                    >
                        Delete Mapping
                    </Button>
                )}
            </Layout.Section>
        </Layout>
    </AlphaStack>
  );
}


